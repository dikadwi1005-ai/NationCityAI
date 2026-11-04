# Phase 5C — Visual Quality Pass 2

## Hasil dan batas scope

HUD fullscreen dipertahankan. Pass ini mengubah geometri, lingkungan, terrain visual, kamera, batching dan simulasi; bukan hanya CSS. [PR #2](https://github.com/dikadwi1005-ai/NationCityAI/pull/2) tetap draft di atas release Phase 5B. Tidak ada merge, provisioning Railway/AWS, deployment production, perubahan backend pemerintahan/voting/chat/auth, atau pekerjaan Phase 6.

Checkpoint `checkpoint/phase-5c-before-quality-pass-2` dibuat dari `c0af11f` sebelum perubahan. Backup SQLite konsisten terenkripsi dibuat dan dipulihkan ke file terpisah; signature seluruh tabel hasil restore cocok. File/operator log dan identitas vault tetap privat.

## Dunia permanen dan Demo City

- Sumber permanen tetap `data/nation.sqlite`: 25 tabel, 32 objek asli, revisi 0. Seluruh ID, koordinat, warga, statistik dan data backend dibandingkan sebelum/sesudah. Tidak ada bangunan/ruas jalan demo yang dimasukkan ke SQLite.
- `/demo-city` membuat `World` deterministik di memori: **255 objek** — 193 road tiles, 44 rumah, satu balai, dua klinik, tiga taman dan 12 pohon domain. Streetscape dan vegetasi turunan adalah render-only dan tidak dihitung sebagai warga/objek tersimpan.
- Beberapa blok hunian, distrik fasilitas umum/pemerintahan, loop jalan, T-junction, empat arah, tikungan pesisir dan taman memakai **Model, Scene, reducer placement dan simulasi yang sama** dengan dunia asli. Tidak ada renderer palsu khusus screenshot.
- Demo mempunyai grading/ekspansi terrain hanya pada fixture. Generator dan geografi dunia permanen tidak diubah. Rumah tetap lolos aturan daratan, lereng, overlap dan grid Phase 1.
- Tidak ada request `/api/*` selama sesi demo, termasuk penempatan lokal. Reload mengembalikan fixture deterministik. Banner dan tombol **Kembali ke dunia permanen** membuka `/`; tidak ada operasi copy/import/export demo ke database.
- Demo bukan akun administrator nyata. Izin editor hanya berlaku untuk reducer lokal; endpoint server dan autentikasi asli tetap sama.

## Peningkatan 3D

1. **Komposisi/kamera:** home membingkai lingkungan terbangun dengan konteks pulau, bukan seluruh bidang kosong sebagai satu objek kecil. Zoom, orbit, pan, ikhtisar nasional dan focus objek tetap tersedia. Demo membuka framing distrik yang lebih luas; close-up memakai kontrol kamera yang sama.
2. **Rumah:** tiga palet/siluet, termasuk varian bertingkat; gable tertutup, ridge/eaves, kanopi, pintu/handle, jendela fasad/samping, sill, planter, pembatas belakang/samping serta detail akses/halaman.
3. **Fasilitas:** balai memiliki fasad samping, kolom, bukaan pintu/jendela, plinth, tangga dan detail landmark. Klinik mempunyai ribbon fasad, kanopi, bukaan samping, rooftop equipment dan panel 3D.
4. **Jalan:** bentuk diambil dari empat tetangga tile 2 meter. Straight/T/four-way/corner memakai sambungan, curb, marking dan crossing yang konsisten. Marking tikungan mengikuti kurva. Tidak ada perubahan schema/metadata jalan.
5. **Urban environment:** trotoar/slab, lampu jalan, pohon jalan, planter, akses rumah, plaza fasilitas, bay parkir dan kendaraan parkir dibentuk dari geometri 3D. Semua dihitung ulang dari kondisi objek; konflik dengan footprint bangunan baru menekan dekorasi terkait. Pohon dan lampu tidak sengaja ditempatkan pada titik yang sama.
6. **Terrain/pantai:** mesh visual 0,5 meter pada zoom lingkungan, filter pesisir lokal dan warna vertex pasir–rumput mengurangi segitiga kasar. Sampler otoritatif/generator/command terrain tidak diganti. Batuan pesisir diperkecil, green belt ditambah dengan instancing. LOD dan frustum chunk dipertahankan.
7. **Laut:** warna shader membaca depth map dari tinggi terrain visual terhadap permukaan air. Ripple ringan dan pita ombak dekat pantai, bukan tekstur/gambar latar. Kedalaman offshore asli masih sederhana; pass ini tidak mengarang data bathymetry permanen.
8. **Living World:** variasi fase langkah Chibi, bob berjalan, interpolasi posisi/arah berbasis waktu frame, dan kurva lajur cubic dengan heading dari tangent. Pintu tujuan mengikuti rotasi bangunan. Graf memuat distrik terbangun dalam batas maksimum 77×77 node; snapshot area yang identik tidak mereset agen. Tidak ada peningkatan batas NPC: 5/10/18, kendaraan 2/4/7, mobile aktif maksimal 5/2.

## Batching dan picking

`StaticWorld` mengompilasi geometri dari komponen Model yang sama menjadi batch per material. Transformasi, normal dan konformasi road terhadap terrain dibake, lalu geometry sementara dilepas. Rentang triangle menyimpan ID domain untuk picking, sehingga admin tetap memilih/memindah/memutar objek yang sama. Draft dan pratinjau katalog tetap memakai Model asli.

`UrbanEnvironment` memakai instancing per primitive/material. Geometri/material bersama dipertahankan, instance buffer dan geometry batch dilepas ketika snapshot berubah/unmount. Tidak ada event pointer pada NPC/dekorasi yang mencuri placement.

## Performa terukur

Edge 156.0.4314.58, AMD Radeon melalui ANGLE/D3D11, 1600×1000, build produksi lokal. Tiga sampel per setting setelah settle; pengukuran singkat, bukan soak/kapasitas nasional. [Data mentah](phase-5c/pass2/verification.json).

| Dunia | Density | NPC/kendaraan | FPS sampel (dibulatkan) | Draw calls |
|---|---|---:|---|---:|
| Harapan fixture identik sumber | Off | 0/0 | 90 / 90 / 90 | 110 |
| Harapan | Low | 5/2 | 90 / 90 / 90 | 274 |
| Harapan | Medium | 10/4 | 90 / 90 / 90 | 446 |
| Harapan | High | 18/5 | 90 / 90 / 90 | 694 |
| Demo City | Off | 0/0 | 90 / 90 / 90 | 146 |
| Demo City | Low | 5/2 | 90 / 90 / 90 | 310 |
| Demo City | Medium | 10/4 | 90 / 90 / 90 | 482 |
| Demo City | High | 18/7 | 90 / 88 / 90 | 752 |

Default dunia permanen tetap Low. Demo desktop membuka Medium untuk review aktivitas, mobile dibatasi otomatis. Emulasi viewport 390×844 pada GPU desktop: sekitar 90 FPS, 267 draw calls, 5 NPC/2 kendaraan. **Ini bukan hasil ponsel fisik.** Run awal sebelum pengukuran final sempat mencatat 74–79 FPS pada High demo; ada variasi beban/scheduling, sehingga 90 FPS bukan jaminan. Tidak ada janji performa ribuan objek/agen.

## Pengujian

- 38 unit/domain tests: validasi semua objek demo, determinisme, junction topology, kontinuitas posisi/tangent belokan, immutable source dan visual coast filtering, ditambah seluruh domain Phase 1–5B.
- Typecheck/build produksi, termasuk checkout Git terpisah.
- Browser Pass 2: ukuran canvas, kamera, picking ID hasil batch, close-up, NPC/kendaraan bergerak, semua density, placement demo lokal, reload, nol API demo, kembali ke permanen, tidak overflow mobile, nol page/shader/geometry error.
- Regresi placement/terrain/undo/redo/restart, visual/catalog/persistent canvas, Living World pause/resume/speed, dua akun/joystick/travel/reconnect, Proximity Chat, government/elections, serta native PostgreSQL 18.6 dengan HTTPS/WSS lokal/mobile/restore.
- Recovery dan migrasi PostgreSQL serta kontrak S3 stub lulus. Tidak ada pengujian atau klaim backup bucket AWS nyata pada pass ini.
- Audit runtime sumber aktual setelah pengujian: signature seluruh 25 tabel tetap sama; 32 objek, revisi 0, integrity OK.

## Bukti game berjalan

| Permintaan | Bukti |
|---|---|
| Pulau Harapan asli | [Runtime sumber permanen](phase-5c/pass2/harapan-live.png), [framing fixture identik](phase-5c/pass2/harapan-after.png) |
| Demo City overview | [Overview](phase-5c/pass2/demo-overview.png) |
| Kamera lingkungan lebih dekat | [Neighborhood](phase-5c/pass2/demo-neighborhood.png) |
| Jaringan jalan/persimpangan | [Roads](phase-5c/pass2/roads-intersections.png) |
| NPC/kendaraan beraktivitas | [Activity](phase-5c/pass2/neighborhood-activity.png), [rekaman Demo City 7 detik](phase-5c/pass2/demo-city.webm) |
| Close-up rumah | [House](phase-5c/pass2/house-close.png) |
| Close-up balai/klinik | [Hall](phase-5c/pass2/hall-close.png), [Clinic](phase-5c/pass2/clinic-close.png) |
| Pantai/laut | [Coast](phase-5c/pass2/coast-ocean.png), [rekaman Harapan 5 detik](phase-5c/pass2/harapan.webm) |
| Mobile emulasi | [Mobile](phase-5c/pass2/demo-mobile.png) |

Rekaman berasal dari captureStream canvas WebGL aplikasi, bukan animasi buatan dari screenshot. HUD ada pada screenshot; video canvas tidak merekam DOM HUD. Screenshot pengujian dan fixture ditandai terpisah dari runtime permanen.

## Batasan yang tetap nyata

- Ini kota demonstrasi stylized skala kecil, bukan simulator ekonomi/zoning/layanan kota atau Phase 6. Aset aktif domain tetap enam jenis, tidak ada high-rise/zoning baru yang dipaksakan ke schema lama.
- Trotoar, halaman, lampu, vegetasi dan parkir turunan tidak menjadi collision/persistence baru. Parking masih sederhana dan kendaraan layanan parkir bersifat dekoratif. Tidak ada jaringan pedestrian/interior/traffic-light otoritatif atau jaminan antrean bebas deadlock.
- Filtering hanya untuk terrain render. Sampler gerak/penempatan server tetap asli; tepi pantai memiliki toleransi visual lokal. LOD jauh tetap lebih kasar; belum ada bathymetry detail.
- NPC lokal tidak disinkronkan antarclient; perubahan density/topologi dapat memulai ulang simulasi dekoratif. Jumlah agen tetap dibatasi.
- Masih perlu penilaian visual pemilik, ponsel fisik (pan/pinch, keyboard chat, thermal) dan rendering soak panjang. Pass 2 tidak dianggap persetujuan beta publik atau penutupan review seni seluruh Phase 5C.

## File utama

`packages/world-engine/demo-city.ts`, `visual-terrain.ts`, `Models.tsx`, `living-world.ts`, `Chibi.tsx`; `apps/web/components/StaticWorld.tsx`, `UrbanEnvironment.tsx`, `TerrainSurface.tsx`, `Ocean.tsx`, `WorldAtmosphere.tsx`, `LivingWorld.tsx`, `Scene.tsx`, `Game.tsx`, `GameView.tsx`; `apps/web/app/demo-city/page.tsx`; `tests/quality-pass2.test.ts`, `quality-pass2.mjs`.
