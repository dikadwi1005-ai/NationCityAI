# AI NATION BUILDER
## PHASE 5C — COMPLETE GAME UI/UX & 3D VISUAL OVERHAUL
### Fullscreen Nation Simulation, Premium City-Builder HUD & Enhanced 3D World

Saya ingin melakukan perombakan besar terhadap **tampilan visual AI Nation Builder** sebelum melanjutkan Phase 6 dan sebelum membuka Closed Beta kepada followers.

**Tugas ini bukan redesign dashboard biasa. Saya ingin AI Nation Builder terlihat dan terasa seperti game simulasi pembangunan negara 3D yang sungguhan.**

Arah kualitas visual yang saya inginkan adalah pengalaman modern city-builder seperti Cities: Skylines dalam hal komposisi layar, kenyamanan kamera, kualitas lingkungan, dan sistem HUD, tetapi seluruh desain, model, ikon, dan identitas visual harus orisinal.

Saya tidak ingin hasil akhir hanya mengganti CSS, memperkecil sidebar, atau menambahkan efek blur.

Saya ingin perombakan nyata pada:
1. Layout game.
2. Fullscreen 3D viewport.
3. HUD dan toolbar.
4. Build catalog.
5. Model 3D bangunan.
6. Model 3D jalan.
7. Terrain, laut, pantai, dan vegetasi.
8. Kamera dan pencahayaan.
9. Tampilan pemerintahan.
10. Tampilan warga dan multiplayer.
11. Responsivitas desktop dan mobile.
12. Kualitas pengalaman pengguna secara keseluruhan.

---

# 1. READ THE EXISTING PROJECT FIRST

Sebelum mengubah kode, baca:

- `PROJECT_MASTER.md`
- `docs/ARCHITECTURE.md`
- `docs/ROADMAP.md`
- `docs/PHASE_1_REPORT.md`
- `docs/PHASE_2_REPORT.md`
- `docs/PHASE_3_REPORT.md`
- `docs/PHASE_4_REPORT.md`
- `docs/PHASE_5_REPORT.md`
- `docs/PHASE_5B_RUNTIME_AUDIT.md`
- Seluruh komponen React, React Three Fiber, Three.js, dan styling yang terkait.

Periksa screenshot tampilan aplikasi saat ini yang saya lampirkan.

Jadikan screenshot tersebut sebagai **referensi masalah yang harus diperbaiki, bukan desain yang harus dipertahankan**.

Tetap gunakan repository dan teknologi yang sudah ada.

Jangan melakukan rewrite backend tanpa alasan.

Jangan menghapus atau mereset database.

Pertahankan persiapan Railway, PostgreSQL, dan backup cloud dari Phase 5B.

Jika Phase 5B masih memiliki proses aktif, selesaikan atau hentikan secara aman sebelum melakukan perubahan yang berpotensi konflik.

---

# 2. CURRENT DESIGN PROBLEMS

Tampilan sekarang memiliki masalah berikut:

### Problem A — Dashboard-Like Layout

Sidebar kiri memakan area besar dan membuat aplikasi terlihat seperti CMS.

### Problem B — Small Game View

Viewport 3D terasa seperti elemen yang ditempelkan di halaman website, bukan game utama.

### Problem C — Weak 3D Assets

Rumah, balai negara, klinik, jalan, dan pohon terlalu sederhana.

Bangunan terlihat seperti bentuk geometris demonstrasi, bukan aset game.

### Problem D — Unconvincing Environment

Pulau terlihat kecil, kosong, dan tidak memiliki cukup detail lingkungan.

Permukiman terlihat seperti sekumpulan objek sederhana di atas bidang datar.

### Problem E — Poor Game Presentation

Belum ada build HUD yang terasa profesional.

Toolbar, kategori pembangunan, informasi wilayah, dan kamera belum terintegrasi sebagai satu pengalaman simulasi.

**Semua masalah tersebut wajib ditangani. Jangan hanya memperbaiki sebagian kecil.**

---

# 3. FULLSCREEN GAME VIEWPORT — HIGHEST PRIORITY

Buat viewport Three.js menjadi bagian utama aplikasi yang mengisi seluruh area layar game.

Target:

- Viewport memenuhi 100% lebar dan tinggi area game.
- Gunakan layout berbasis `100dvh` atau solusi setara.
- Tidak ada sidebar permanen yang mengurangi ukuran viewport.
- Tidak ada halaman utama yang memerlukan scrolling vertikal hanya untuk melihat dunia.
- Panel HUD berada sebagai overlay di atas canvas.
- Canvas tetap berjalan ketika panel dibuka atau ditutup.
- Tidak ada remount WebGL yang tidak perlu.
- Resize viewport berjalan dengan benar.
- Tidak ada area kosong besar yang tidak memiliki fungsi.

Game harus langsung memperlihatkan dunia 3D ketika dibuka.

**Viewport merupakan produk utama. UI adalah alat bantu di atas viewport.**

Jangan mempertahankan layout lama dengan 20–30% layar digunakan untuk sidebar statis.

---

# 4. PREMIUM SIMULATION GAME HUD

Desain HUD baru menggunakan komposisi berikut.

## A. Top HUD

Buat top bar yang ramping, transparan atau semi-transparan, dengan informasi:

- Logo AI Nation Builder.
- Nama negara.
- Nama pulau atau wilayah aktif.
- Jumlah warga online jika tersedia.
- Status koneksi.
- Notifikasi.
- Akses profil warga.
- Akses pemerintahan.
- Menu utama.
- Admin controls jika memiliki izin.

Hindari header website biasa yang terlalu tinggi.

## B. Left Floating Tools

Gunakan toolbar vertikal ringkas.

Menu:
- World / Atlas.
- Build.
- Terrain.
- Infrastructure.
- Government.
- Citizens.
- Settings.

Ketika menu dipilih, tampilkan floating drawer.

Ketika menu ditutup, viewport kembali terlihat sepenuhnya.

## C. Bottom Building Dock

Buat toolbar bawah bergaya simulation game.

Kategori:

- Residential.
- Government.
- Healthcare.
- Roads.
- Transportation.
- Utilities.
- Nature.
- Decoration.

Gunakan ikon konsisten dan keadaan aktif yang jelas.

Dock harus ringkas secara default.

## D. Right Floating Controls

Tambahkan:
- Kamera.
- Zoom.
- Rotate.
- Reset Camera.
- Map Layers.
- Mini Map atau National Overview.
- Grafik Quality Settings.

Jangan membuat tombol terlalu besar.

## E. Bottom Status HUD

Tampilkan informasi seperlunya:
- Mode aktif.
- Nama objek yang dipilih.
- Status penyimpanan.
- Instruksi singkat kontrol.
- Informasi validasi pembangunan.

Jangan memenuhi viewport dengan teks panjang.

---

# 5. BUILD MODE & EXPLORE MODE

Pisahkan pengalaman pengguna secara jelas.

## Explore Mode

Ditujukan kepada pengunjung dan warga.

Fitur:
- Menjelajahi negara.
- Menggerakkan karakter Chibi.
- Melihat bangunan.
- Bertemu pemain lain.
- Proximity Chat.
- Berinteraksi dengan tempat tertentu.
- Membuka peta negara.

Tidak perlu memperlihatkan seluruh alat pembangunan.

## Build Mode

Hanya untuk pengguna dengan izin pembangunan yang sah.

Fitur:
- Pilih kategori.
- Pilih bangunan.
- Preview penempatan.
- Rotate.
- Move.
- Remove.
- Undo.
- Redo.
- Save.
- Collision feedback.
- Terrain suitability feedback.

Jangan membuat hak Build Mode tersedia hanya karena seorang warga mempunyai jabatan pemerintahan.

Pejabat virtual harus tetap mengikuti sistem permission yang sudah ada.

## Terrain Mode

Fitur:
- Raise terrain.
- Lower terrain.
- Smooth.
- Paint.
- Expand land.
- Create island.
- Water tools.

Integrasikan dengan World Engine Phase 2.

Gunakan UI yang mudah dipahami dan tidak menghalangi area edit.

---

# 6. REDESIGN ALL BUILDING ASSETS

**Ini merupakan pekerjaan utama, bukan opsional.**

Saya tidak puas dengan kualitas bangunan 3D saat ini.

Jangan hanya mengubah warna material.

Saya ingin model baru atau peningkatan geometri yang signifikan.

## Residential Buildings

Bangun rumah stylized 3D yang mempunyai:

- Atap dengan ketebalan dan overhang.
- Dinding dengan proporsi jelas.
- Pintu dan jendela.
- Teras.
- Tangga kecil bila sesuai.
- Material yang konsisten.
- Detail atap.
- Variasi bentuk bangunan.
- Bayangan yang rapi.

Tambahkan beberapa variasi visual rumah.

Rumah harus tetap terbaca jelas dari kamera isometrik.

## Government Buildings

Balai negara tidak boleh terlihat seperti kotak sederhana.

Buat sebagai landmark yang memiliki:
- Bangunan utama.
- Pintu masuk.
- Tangga.
- Pilar atau elemen arsitektur orisinal.
- Atap khas.
- Halaman depan.
- Penanda fungsi pemerintahan.

Buat lebih menonjol daripada rumah biasa.

## Healthcare Buildings

Klinik harus memiliki identitas arsitektur yang mudah dikenali.

Gunakan:
- Entrance.
- Jendela.
- Atap.
- Papan nama atau simbol kesehatan.
- Detail fasad.
- Aksen warna yang konsisten.

## Object Scale

Audit skala seluruh objek.

Pastikan:
- Rumah tidak terlalu kecil dibanding jalan.
- Karakter Chibi tidak terlalu besar dibanding bangunan.
- Jalan mempunyai lebar yang logis.
- Kantor pemerintahan memiliki skala yang pantas.
- Pohon konsisten terhadap lingkungan.

Jangan mengubah footprint, collision, atau koordinat domain secara sembarangan.

Jika peningkatan visual memerlukan penyesuaian skala, pisahkan skala visual dari footprint logis dan verifikasi tabrakan.

---

# 7. ROAD & INFRASTRUCTURE VISUALS

Perombak tampilan jalan.

Saat ini jalan terlalu mirip balok panjang dengan garis sederhana.

Saya ingin:
- Material permukaan jalan lebih meyakinkan.
- Ketebalan sesuai terrain.
- Marka jalan lebih baik.
- Sambungan antarsegmen yang rapi.
- Tikungan yang tidak terlihat patah secara berlebihan.
- Persimpangan yang terlihat jelas.
- Trotoar atau bahu jalan untuk kategori yang sesuai.
- Tidak ada visual z-fighting.
- Jalan mengikuti elevasi terrain dengan benar.

Pastikan jalan tetap kompatibel dengan sistem objek dan editing yang sudah ada.

Jangan mengubah jalan hanya menjadi texture plane yang tidak memiliki interaksi pembangunan.

---

# 8. TERRAIN, WATER & WORLD VISUALS

Saya ingin dunia negara terasa lebih hidup.

## Terrain

Tingkatkan:
- Warna rumput.
- Variasi permukaan.
- Blend antara pantai dan dataran.
- Bentuk perbukitan.
- Transisi elevasi.
- Kesan kedalaman.
- Material berdasarkan biome.

Kurangi kesan terrain seperti papan kotak-kotak jika itu bukan bagian dari mode editing.

Grid hanya ditampilkan secara jelas ketika diperlukan dalam Build Mode.

## Water

Tingkatkan:
- Warna laut.
- Refleksi atau highlight ringan.
- Gerakan permukaan air yang efisien.
- Shoreline transition.
- Kedalaman warna sesuai area.

Tidak perlu mengejar fotorealisme.

Targetnya stylized game water yang indah dan ringan untuk browser.

## Vegetation

Perbaiki:
- Model pohon.
- Variasi bentuk.
- Variasi ukuran.
- Distribusi vegetasi.
- Penempatan yang alami.
- Beban rendering.

Gunakan instancing atau optimasi sejenis bila sesuai.

## Environmental Detail

Tambahkan detail lingkungan yang relevan:
- Batu.
- Semak.
- Rumput.
- Jalur setapak.
- Area plaza.
- Dekorasi lingkungan.
- Detail pesisir.

Jangan memenuhi pulau dengan objek acak tanpa memperhatikan struktur permukiman.

---

# 9. WORLD COMPOSITION

Perbaiki tata letak awal Pulau Harapan.

Saat aplikasi dibuka, saya ingin melihat komposisi dunia yang lebih menarik.

Contoh:
- Kawasan permukiman terlihat jelas.
- Jalan menghubungkan bangunan secara alami.
- Balai negara menjadi landmark.
- Klinik berada pada lokasi yang masuk akal.
- Ada ruang hijau.
- Ada lingkungan pesisir.
- Terdapat elevasi terrain yang menarik.

**Jangan merusak 32 objek awal atau melakukan reset database demi mempercantik tampilan.**

Jika memerlukan layout demo baru, gunakan scene presentasi atau data seed visual yang terpisah.

Perubahan permanen ke dunia utama harus melalui perintah yang valid dan dapat dipulihkan.

Pulau Sagara dan pulau tambahan di masa depan harus tetap kompatibel.

---

# 10. LIGHTING & CAMERA OVERHAUL

Tingkatkan pencahayaan dengan:
- Directional sunlight.
- Ambient fill lighting.
- Soft shadows.
- Ambient occlusion ringan jika memungkinkan.
- Pengaturan tone mapping yang sesuai.
- Warna langit dan lingkungan konsisten.

Hindari tampilan terlalu pucat, datar, atau overexposed.

Kamera:
- Isometric / simulation perspective.
- Smooth pan.
- Smooth zoom.
- Smooth orbit.
- Comfortable default angle.
- Focus on selected building.
- Focus on active region.
- Reset camera.
- Transition antarpulau yang halus.

Kamera harus nyaman dipakai dalam sesi pembangunan panjang.

---

# 11. MODERN BUILDING CATALOG

Saya ingin build catalog terasa seperti katalog aset game.

Setiap item dapat menampilkan:
- Thumbnail visual 3D.
- Nama.
- Kategori.
- Ukuran footprint.
- Fungsi singkat.
- Informasi penempatan.
- Status tersedia atau terkunci.

Gunakan tombol dan interaksi yang jelas.

Preview 3D harus menampilkan aset yang sama dengan objek sebenarnya.

Jangan menggunakan gambar katalog yang berbeda jauh dari model yang akan ditempatkan.

Buat panel mudah dicari, difilter, dan ditutup.

---

# 12. GOVERNMENT & ELECTION UI

Sesuaikan tampilan pemerintahan dengan identitas visual game baru.

Halaman:
- Government Overview.
- Election Center.
- Candidate Profiles.
- Government Offices.
- Citizen Proposals.
- Admin Election Management.

Gunakan desain seperti antarmuka simulasi negara modern.

Tampilkan:
- Struktur hierarki pemerintahan.
- Jabatan.
- Foto/avatar 3D karakter.
- Nama wilayah.
- Masa jabatan.
- Status pemilihan.
- Informasi kandidat.

Jangan mengubah backend voting yang sudah lulus pengujian.

Pisahkan UI publik dari UI administratif.

---

# 13. CHIBI & MULTIPLAYER PRESENTATION

Pastikan karakter Chibi terlihat cocok dengan bangunan dan lingkungan baru.

Perbaiki bila diperlukan:
- Proporsi relatif terhadap dunia.
- Warna dan material.
- Bayangan karakter.
- Nameplate.
- Animasi berjalan.
- Interaksi dengan lingkungan.

Panel Proximity Chat harus menjadi floating game HUD.

Chat tidak boleh mendominasi layar.

Jika tidak ada warga sekitar, cukup tampilkan indikator minimal.

Jangan merusak sistem proximity radius 120 meter dan otorisasi pesan di server.

---

# 14. MOBILE & RESPONSIVE EXPERIENCE

Gunakan pendekatan desktop-first untuk antarmuka editor, tetapi dukung akses mobile.

Desktop:
- Fullscreen viewport.
- Bottom dock.
- Floating HUD.
- Mouse dan keyboard.

Mobile:
- Viewport tetap dominan.
- Toolbar compact.
- Bottom sheet untuk katalog.
- Joystick untuk Explore Mode.
- Touch camera.
- Chat yang dapat diminimalkan.
- Safe-area support.
- Navigasi tanpa overflow.

Jangan hanya mengecilkan layout desktop untuk mobile.

Jangan mengklaim mobile siap jika kontrol sentuh belum diuji.

---

# 15. PERFORMANCE REQUIREMENTS

Visual harus meningkat tanpa membuat game terlalu berat.

Pertahankan atau optimalkan:
- Chunk loading.
- Frustum culling.
- Instanced vegetation.
- Asset reuse.
- Shared geometry/materials.
- Texture compression jika digunakan.
- Lazy loading.
- Adaptive rendering quality.
- WebGL resource cleanup.

Ukur:
- FPS.
- Draw calls.
- Triangle count.
- Memory usage bila dapat diukur.
- Waktu loading.
- Ukuran bundle.
- Respons interaksi kamera.

Target awal:
- Desktop menengah: sekitar 60 FPS pada skenario pengujian yang terdefinisi.
- Mobile: sekitar 30 FPS jika perangkat mendukung.

Jika target belum tercapai, laporkan perangkat, skenario, hasil aktual, dan bottleneck. Jangan mengarang hasil benchmark.

---

# 16. DESIGN SYSTEM

Bangun sistem desain yang konsisten.

Gunakan:
- Modern game HUD.
- Floating panels.
- Konsistensi spacing.
- Icon system.
- Clear hierarchy.
- Subtle translucent surfaces.
- Soft shadows.
- Restrained accent colors.
- Readable typography.
- Smooth microinteractions.

Gunakan warna terinspirasi alam seperti forest green, deep teal, slate, dan warm ivory, tetapi jangan membuat seluruh dunia terlalu pucat.

Hindari:
- Sidebar CMS permanen.
- Panel besar tanpa fungsi.
- Tombol yang terlihat seperti form admin.
- Teks panjang yang menutupi viewport.
- Ikon generik tidak konsisten.
- Efek blur berlebihan.
- Animasi yang membuat interaksi lambat.

---

# 17. NO FAKE IMPROVEMENTS

Saya tidak menerima pekerjaan yang hanya berupa:
- Perubahan warna CSS.
- Sidebar dipindah dari kiri ke kanan.
- Menambahkan gradient.
- Menambahkan shadow.
- Memperbesar pulau tanpa memperbaiki model.
- Menggunakan screenshot statis sebagai pengganti viewport.
- Menambahkan tombol yang belum berfungsi.
- Menampilkan mockup dan mengklaim implementasi selesai.

Saya menginginkan perubahan yang nyata pada **game yang sedang berjalan**.

Setiap tombol harus menjalankan fitur yang sesuai.

Setiap thumbnail aset harus merepresentasikan model sebenarnya.

Setiap model 3D harus benar-benar muncul di dunia.

---

# 18. STRICT DATA PROTECTION

Jangan menghapus atau merusak:
- Database SQLite.
- ID bangunan.
- Posisi bangunan.
- Terrain data.
- Pulau.
- World events.
- Akun warga.
- Karakter Chibi.
- Status pemerintahan.
- Voting.
- Riwayat pemilihan.
- Sistem backup.
- Persiapan Railway/PostgreSQL.

Jangan melakukan migrasi database yang tidak dibutuhkan untuk redesign visual.

Ambil backup dan buat checkpoint perubahan terlebih dahulu.

---

# 19. IMPLEMENTATION ORDER

Kerjakan dalam urutan berikut:

### Stage A — Fullscreen Game Shell
- Fullscreen viewport.
- HUD overlay.
- Floating tools.
- Bottom toolbar.
- Panel collapse/expand.

### Stage B — 3D Asset Overhaul
- Rumah.
- Balai negara.
- Klinik.
- Jalan.
- Pohon.
- Lingkungan.

### Stage C — World Presentation
- Terrain.
- Water.
- Lighting.
- Shadows.
- Camera.
- Default world composition.

### Stage D — Game Interaction Polish
- Build catalog.
- Object selection.
- Placement preview.
- Tooltips.
- Smooth UI transitions.

### Stage E — Citizen & Government Visual Integration
- Citizen menus.
- Explore Mode.
- Chibi presentation.
- Proximity Chat UI.
- Government pages.

### Stage F — Responsive Optimization & Testing
- Desktop.
- Tablet.
- Mobile.
- Performance.
- Accessibility.
- Regression testing.

Jangan berhenti setelah Stage A dan mengklaim keseluruhan Visual Overhaul sudah selesai.

---

# 20. ACCEPTANCE TESTS

Pengujian wajib mencakup:

1. Buka AI Nation Builder pada resolusi 1920×1080.
2. Pastikan viewport 3D memenuhi area game.
3. Pastikan tidak ada sidebar permanen.
4. Buka Build Mode.
5. Buka dan tutup katalog.
6. Tempatkan bangunan baru.
7. Pastikan model baru benar-benar digunakan.
8. Rotasi dan pindahkan objek.
9. Refresh halaman.
10. Pastikan bangunan tetap ada.
11. Buka Atlas Negara.
12. Navigasi antarpulau.
13. Uji Terrain Editor.
14. Uji Explore Mode.
15. Uji dua karakter multiplayer.
16. Uji Proximity Chat.
17. Uji halaman pemerintahan.
18. Uji voting pada database tes terpisah.
19. Uji desktop 1440×900.
20. Uji mobile 390×844.
21. Jalankan TypeScript checks.
22. Jalankan production build.
23. Jalankan automated regression tests.
24. Periksa console errors dan WebGL warnings.

Lakukan browser acceptance testing terhadap implementasi nyata.

---

# 21. VISUAL VERIFICATION

Saya ingin bukti perubahan visual yang jelas.

Ambil screenshot:

**BEFORE**
- Screenshot tampilan lama.

**AFTER**
- Fullscreen game overview.
- Build Mode.
- Building catalog.
- Close-up rumah.
- Close-up balai negara.
- Road system.
- Terrain dan coastline.
- Explore Mode dengan karakter Chibi.
- Government UI.
- Mobile layout.

Pastikan seluruh screenshot berasal dari aplikasi yang benar-benar berjalan.

Jangan gunakan AI-generated images sebagai bukti hasil implementasi.

---

# 22. FINAL DELIVERABLES

Hasil akhir wajib mencakup:

1. Game viewport fullscreen.
2. HUD simulation game modern.
3. Build toolbar yang berfungsi.
4. Katalog bangunan yang lebih profesional.
5. Model rumah yang lebih berkualitas.
6. Model balai negara yang lebih detail.
7. Model klinik yang lebih jelas.
8. Visual jalan yang lebih baik.
9. Terrain dan lingkungan yang lebih indah.
10. Kamera dan lighting yang ditingkatkan.
11. UI warga dan pemerintahan yang konsisten.
12. Mobile layout yang usable.
13. Tidak ada regresi fungsi Phase 1–5.
14. Screenshot before/after.
15. Laporan hasil pengujian dan performa.

Buat dokumentasi:

`docs/PHASE_5C_VISUAL_OVERHAUL_REPORT.md`

Sertakan daftar file yang berubah, keputusan desain, bukti screenshot, hasil pengujian, serta pekerjaan yang masih belum selesai.

---

# 23. FINAL INSTRUCTION

**Mulai implementasi Phase 5C — Complete Game UI/UX & 3D Visual Overhaul sekarang.**

Saya ingin perubahan yang signifikan, bukan sekadar facelift.

AI Nation Builder harus terasa seperti **game 3D nation-building sungguhan**, bukan dashboard admin dengan pulau kecil di sebelah kanan.

Gunakan standar kualitas visual yang tinggi, namun realistis untuk browser dan perangkat pemain.

Jangan mengubah identitas dan logika proyek yang sudah dibangun.

Jangan melanjutkan Phase 6.

Jangan membuka Closed Beta publik sebelum visual overhaul selesai dan saya menyetujui hasil tampilannya.

Jika pekerjaan terlalu besar untuk diselesaikan dalam satu sesi, kerjakan secara bertahap dengan checkpoint yang benar-benar berfungsi. Laporkan bagian yang selesai dan bagian yang masih tersisa, tanpa mengklaim seluruh pekerjaan selesai sebelum kriteria penerimaan terpenuhi.

**Prioritas tertinggi adalah fullscreen gameplay, kualitas aset 3D, game HUD, dan konsistensi visual keseluruhan negara.**