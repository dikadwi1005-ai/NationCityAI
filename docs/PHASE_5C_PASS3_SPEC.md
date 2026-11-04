# AI NATION BUILDER — PHASE 5C QUALITY PASS 3
## SEMI-REALISTIC WORLD TRANSFORMATION
### Premium City Simulation Visual Direction

Saya telah memutuskan bahwa **arah visual final AI Nation Builder adalah SEMI-REALISTIC 3D CITY & NATION SIMULATION**.

Saya tidak lagi ingin kualitas dunia berhenti pada bentuk low-poly sederhana seperti pada Demo City saat ini.

Saya ingin meningkatkan game menjadi simulasi pembangunan negara yang lebih realistis dari sisi proporsi bangunan, struktur kota, lingkungan, jalan, dan presentasi visual.

Referensi kualitas dan pengalaman adalah game city-building modern seperti Cities: Skylines, tetapi aset, desain visual, dan identitas AI Nation Builder harus tetap orisinal.

Ini bukan instruksi untuk menyalin aset maupun tampilan game tersebut.

## 1. EXISTING PROJECT — DO NOT REBUILD

Lanjutkan dari source Phase 5C terbaru di PR #2.

Pertahankan:
- Fullscreen 3D viewport.
- HUD overlay.
- Build catalog.
- World Engine.
- Terrain Editor.
- Island Atlas.
- Character Creator.
- Multiplayer Colyseus.
- Proximity Chat.
- Government & Election.
- Living World.
- Dummy NPC.
- Vehicle Simulation.
- PostgreSQL/Railway preparation.
- Data protection dan sistem backup.

Jangan melakukan rewrite besar terhadap backend.

Jangan menambahkan data Demo City ke database permanen.

Jangan melanjutkan Phase 6.

## 2. VISUAL TARGET — SEMI-REALISTIC

Target utama saya adalah perpaduan antara:

- Proporsi dunia yang realistis.
- Arsitektur modern dengan detail nyata.
- Material PBR yang berkualitas.
- Lingkungan tropis yang natural.
- Pencahayaan dan bayangan yang meyakinkan.
- Gameplay city-builder yang nyaman.
- Performa browser yang terjaga.

Hindari:
- Bangunan seperti balok mainan.
- Pohon berbentuk kumpulan polygon besar.
- Terrain yang terlihat seperti papan.
- Jalan terlalu sederhana.
- Rumah yang semua bentuknya sama.
- Bangunan berulang tanpa identitas.
- Kota yang terlihat seperti diorama mini.

Saya ingin dunia lebih meyakinkan dari jarak kamera overview maupun close-up.

## 3. SEMI-REALISTIC ARCHITECTURE SYSTEM

Perbarui sistem model bangunan.

### Residential

Buat beberapa tipe arsitektur:

- Rumah tropis sederhana.
- Rumah modern satu lantai.
- Rumah modern dua lantai.
- Townhouse.
- Rumah dengan carport.
- Rumah dengan balkon.
- Rumah dengan pagar dan halaman.
- Rumah beratap miring dan datar.

Tiap tipe memiliki perbedaan geometri nyata.

Gunakan detail:
- Dinding dan material fasad.
- Kusen.
- Jendela berkaca.
- Pintu.
- Atap dan talang.
- Teras.
- Balkon.
- Tangga.
- Pagar.
- Halaman.
- Lampu eksterior.
- Detail arsitektur secukupnya.

Jangan hanya membedakan rumah melalui warna.

### Government

Balai negara harus menjadi bangunan landmark yang dapat dikenali dari jarak jauh.

Tingkatkan:
- Proporsi arsitektur.
- Fasad.
- Pilar dan entrance.
- Tangga.
- Halaman.
- Plaza.
- Area upacara.
- Jalur pedestrian.
- Taman.
- Pencahayaan lingkungan.

### Healthcare

Klinik harus terlihat seperti fasilitas kesehatan modern.

Gunakan arsitektur yang konsisten dengan dunia AI Nation Builder.

### Commercial & Public Facilities

Tambahkan aset untuk:
- Toko kecil.
- Ruko.
- Kafe.
- Gedung layanan.
- Fasilitas rekreasi.
- Tempat parkir.
- Bangunan publik.

Jika belum didukung oleh katalog domain utama, aset tersebut hanya boleh muncul dalam Demo City sebagai aset fixture yang ditandai jelas.

Jangan mengklaim aset demo sudah bisa dibangun pemain apabila belum didukung sistem placement.

## 4. BUILDING SCALE & WORLD UNITS

Audit proporsi seluruh scene.

Pastikan:
- Tinggi manusia terhadap bangunan masuk akal.
- Pintu cukup besar untuk karakter.
- Mobil sesuai ukuran jalan.
- Trotoar sesuai karakter.
- Pohon sesuai tinggi bangunan.
- Jalan utama lebih lebar secara visual daripada jalan kecil.
- Bangunan tidak terlihat seperti miniatur mainan.

**Jangan mengubah koordinat, footprint, atau collision server secara sembarangan.**

Karena sistem jalan dan bangunan menggunakan grid 2 meter, periksa kompatibilitas ukuran sebelum membuat model baru.

Jika ukuran domain lama membatasi proporsi realistis, buat visual adapter atau sistem asset scaling terpisah yang tetap konsisten dengan collision dan placement.

Laporkan keterbatasan ukuran yang tidak dapat diselesaikan tanpa migrasi domain.

## 5. PBR MATERIAL & TEXTURING

Gunakan material modern yang efisien.

Contoh:
- Beton.
- Aspal.
- Kaca.
- Kayu.
- Genteng.
- Logam.
- Cat dinding.
- Batu.
- Tanah.
- Rumput.
- Pasir.

Gunakan pendekatan PBR dengan parameter roughness, metalness, normal map, dan ambient occlusion jika sesuai.

Hindari material yang terlihat terlalu plastik.

Gunakan texture atlas, shared materials, dan kompresi aset bila diperlukan.

Hanya gunakan aset orisinal atau aset berlisensi yang kompatibel dengan distribusi proyek. Dokumentasikan lisensinya.

Pertahankan fallback kualitas rendah untuk perangkat yang lebih lemah.

## 6. ROAD SYSTEM — REALISTIC CITY ROADS

Perbaiki visual jaringan jalan agar terlihat seperti jalan kota sungguhan.

Target:
- Jalan lingkungan.
- Jalan utama.
- Marka tengah.
- Zebra cross.
- Trotoar.
- Curb.
- Persimpangan T.
- Persimpangan empat arah.
- Lampu jalan.
- Rambu.
- Area parkir.
- Drainase visual sederhana.
- Koneksi jalan yang rapi.

Jalan harus tetap mengikuti terrain.

Kendaraan harus bergerak pada jalur yang benar.

Jika engine belum mendukung jalan melengkung, jangan membuat spline palsu yang tidak bisa digunakan untuk routing kendaraan.

Pertahankan logika jalan asli dan tingkatkan kualitas renderer terlebih dahulu.

## 7. DEMO CITY REDESIGN

Pertahankan Demo City sebagai fixture lokal yang tidak memengaruhi database permanen.

Ubah komposisinya agar tidak terlihat seperti kawasan perumahan copy-paste.

Buat distrik yang memiliki identitas.

### Residential District
Berbagai tipe rumah, taman kecil, jalan lingkungan, pagar, dan parkir.

### Government District
Balai negara, plaza, taman, jalur pedestrian, dan fasilitas umum.

### Commercial District
Ruko, toko, bangunan komersial kecil, area parkir, dan aktivitas warga.

### Waterfront District
Jalan pesisir, taman tepi laut, jalur pedestrian, vegetasi pantai, dan area rekreasi.

### Green District
Taman besar, jalur pedestrian, vegetasi, dan area terbuka.

Jangan memenuhi setiap ruang kosong dengan bangunan.

Gunakan tata kota yang logis dan memiliki ruang ekspansi.

Pastikan penambahan aset demo tidak membuatnya tampak seolah-olah kategori pembangunan tersebut sudah tersedia di game utama.

## 8. TERRAIN & COASTAL ENVIRONMENT

Perbaiki lingkungan agar tidak terlihat seperti terrain low-poly polos.

Tingkatkan:
- Bentuk permukaan tanah.
- Distribusi grass.
- Material berdasarkan biome.
- Transisi elevasi.
- Tanah.
- Batu.
- Perbukitan.
- Vegetasi tropis.
- Bentuk garis pantai.
- Warna pasir.
- Kedalaman laut.
- Ombak pesisir ringan.
- Foam di garis pantai.

Gunakan visual yang konsisten dengan lingkungan kepulauan tropis Indonesia.

Pantai tidak boleh mempunyai garis segitiga bergerigi yang jelas dari kamera overview.

Pertahankan seluruh data terrain asli.

Gunakan peningkatan renderer, material, dan mesh presentasi tanpa mereset pulau.

## 9. SEMI-REALISTIC VEGETATION

Ganti kesan pohon polygon sederhana menjadi vegetasi yang lebih natural.

Gunakan variasi:
- Pohon tropis.
- Pohon peneduh jalan.
- Pohon kecil.
- Semak.
- Rumput.
- Tanaman halaman.
- Vegetasi pesisir.

Optimalkan melalui instancing dan LOD.

Vegetasi tidak boleh menyebabkan penurunan FPS besar.

Hindari vegetasi yang menutupi jalan, bangunan, atau jalur pedestrian.

## 10. LIVING WORLD VISUAL POLISH

Pertahankan sistem NPC dan kendaraan yang sudah berfungsi.

Tingkatkan kualitas visualnya agar cocok dengan dunia semi-realistis.

### NPC

- Gerakan berjalan lebih halus.
- Animasi idle.
- Transisi arah.
- Animasi interaksi sederhana.
- Variasi pakaian.
- Aktivitas di taman dan fasilitas umum.
- Proporsi yang sesuai lingkungan.

Karakter Chibi tetap dipertahankan sebagai identitas warga, tetapi sesuaikan shading dan presentasinya agar tidak terlalu kontras dengan lingkungan semi-realistis.

### Vehicles

Tingkatkan model:
- Mobil.
- Motor.
- Minibus.
- Kendaraan layanan.

Tambahkan geometri yang lebih baik:
- Body.
- Kaca.
- Ban.
- Lampu.
- Pintu.
- Detail kendaraan.

Perhalus:
- Belokan.
- Kecepatan.
- Pengereman.
- Jarak kendaraan.
- Perilaku di persimpangan.

Jangan mengubah dummy menjadi akun warga asli.

## 11. CAMERA & VISUAL PRESENTATION

Pertahankan kontrol kamera yang sudah berhasil.

Tambahkan atau sempurnakan preset kamera:

- Nation Overview.
- City Overview.
- Neighborhood View.
- Building Focus.
- Explore Mode.

Gunakan perspektif yang membuat kota tampak memiliki ukuran nyata.

Jangan membuat seluruh kota selalu terlihat seperti miniatur.

Perhatikan:
- FOV.
- Perspective distortion.
- Camera distance.
- Clipping.
- Smooth movement.
- Dynamic shadows.
- Level of detail.

Pastikan visual dari sudut kamera dekat tidak memperlihatkan bangunan yang terlalu sederhana.

## 12. LIGHTING & ATMOSPHERE

Gunakan lighting yang lebih natural.

Target:
- Sunlight realistis tetapi tetap artistik.
- Ambient fill.
- Soft shadow.
- Tone mapping.
- Color balance.
- Atmospheric depth.
- Subtle haze.
- Refleksi material yang sesuai.

Pertahankan warna tropis yang segar.

Hindari:
- Overexposure.
- Warna terlalu pucat.
- Kontras berlebihan.
- Semua material terlihat plastik.

Tidak perlu langsung menambahkan sistem siang-malam jika akan mengganggu fokus dan performa fase ini.

## 13. VISUAL QUALITY SETTINGS

Tambahkan atau integrasikan quality presets:

### Low
- Material sederhana.
- Shadow terbatas.
- Vegetasi rendah.
- Detail objek lebih sedikit.
- Efek air ringan.

### Medium
- Material standar.
- Shadow sedang.
- Vegetasi normal.
- Bangunan detail menengah.

### High
- Detail bangunan lebih tinggi.
- Material berkualitas.
- Shadow lebih halus.
- Vegetasi lebih kaya.
- Efek lingkungan lebih lengkap.

Pastikan pengaturan benar-benar mengubah beban rendering.

Jangan hanya mengubah label kualitas tanpa efek.

## 14. PERFORMANCE & ARCHITECTURE

Lakukan perubahan visual secara bertahap.

Gunakan komponen, renderer, dan asset registry yang bisa dipelihara.

Hindari menumpuk seluruh model 3D ke satu file besar.

Prioritaskan:
- Shared geometry.
- Material reuse.
- Instancing.
- LOD.
- Frustum culling.
- Batching.
- GPU resource cleanup.
- Texture optimization.
- Lazy loading.

Ukur performa pada dunia asli dan Demo City dengan konfigurasi yang sama.

Target awal pengujian:
- Desktop menengah: mendekati 60 FPS atau lebih.
- Mobile yang mendukung WebGL: target sekitar 30 FPS pada quality Low.

Target tersebut bukan jaminan. Laporkan hasil aktual, perangkat, pengaturan, dan skenario pengujiannya.

Jangan mengklaim performa mobile fisik jika belum diuji.

## 15. IMPLEMENTATION STAGES

Kerjakan secara bertahap dengan checkpoint.

### Stage A — Visual Foundation
Material, pencahayaan, skala, kamera, dan quality presets.

### Stage B — Architecture Overhaul
Rumah, balai negara, klinik, aset fasilitas umum, dan sistem variasi.

### Stage C — Road & Urban Environment
Jaringan jalan, trotoar, marka, persimpangan, parkir, plaza, dan distrik kota.

### Stage D — Natural Environment
Terrain, pantai, laut, vegetasi, dan atmosfer.

### Stage E — Living World Integration
NPC, kendaraan, animasi, dan optimasi pergerakan.

### Stage F — Visual Review & Optimization
Screenshot, gameplay recording, benchmark, regresi, dan perbaikan bug.

Setiap stage harus memiliki hasil yang dapat dijalankan serta checkpoint Git.

Jangan menyatakan semuanya selesai hanya karena Stage A berhasil.

## 16. STRICT DATA SAFETY

Database permanen saat ini:
- 25 tabel.
- 32 objek asli.
- Revisi 0.

Jangan merusaknya.

Semua pengembangan Demo City menggunakan fixture terpisah.

Jangan mengubah ID, koordinat, terrain, akun, atau data voting pada dunia permanen hanya untuk memperindah visual.

Pertahankan backup, restore, dan integrasi Phase 5B.

## 17. TESTING

Lakukan:
- Unit tests.
- Typecheck.
- Production build.
- Browser regression.
- Object placement.
- Terrain editing.
- Road routing.
- NPC movement.
- Vehicle traffic.
- Multiplayer.
- Proximity Chat.
- Government & Election.
- World persistence.
- Demo isolation.
- Performance benchmark.

Periksa memory leak dan WebGL resource cleanup.

Jika ada fitur yang tidak dapat diuji dalam lingkungan saat ini, laporkan secara terbuka.

## 18. VISUAL DELIVERABLES

Saya ingin screenshot dari game nyata:

1. Pulau Harapan asli.
2. Demo City overview.
3. Residential district.
4. Government district.
5. Commercial district.
6. Waterfront district.
7. Rumah semi-realistis close-up.
8. Balai negara close-up.
9. Persimpangan dan jalan.
10. NPC dan kendaraan.
11. Kamera dekat jalan.
12. Mobile quality Low.

Sertakan rekaman gameplay yang menunjukkan kamera, NPC, dan kendaraan bergerak.

Screenshot dan video harus berasal dari renderer aplikasi asli, bukan gambar yang dibuat AI untuk berpura-pura sebagai implementasi.

Buat laporan:

`docs/PHASE_5C_SEMI_REALISTIC_VISUAL_REPORT.md`

Perbarui PR #2 atau gunakan PR lanjutan yang berbasis langsung pada source Phase 5C terbaru, tanpa menimpa pekerjaan sebelumnya.

Jangan merge sebelum review saya.

## 19. FINAL GOAL

Saya ingin AI Nation Builder memiliki identitas sebagai:

**A semi-realistic 3D nation and city-building simulation game with living citizens, traffic, tropical environments, and immersive world exploration.**

Saya tidak ingin game tetap terasa seperti low-poly diorama dengan HUD modern.

Namun jangan mengejar fotorealisme yang mengorbankan seluruh performa browser.

Fokus pada kualitas arsitektur, material, skala, tata kota, lingkungan, dan pengalaman gameplay.

Jangan lakukan deployment Railway/AWS berbayar.

Jangan mulai Phase 6.

**Mulai dari audit source terbaru dan checkpoint aman, lalu implementasikan Stage A–F secara bertahap. Berikan hasil visual nyata agar saya dapat mengevaluasinya sebelum Phase 5C dinyatakan selesai.**