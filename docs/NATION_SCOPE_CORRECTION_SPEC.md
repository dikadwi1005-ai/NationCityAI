Lanjutkan AI Nation Builder dari source terbaru, tetapi saya perlu mengoreksi arah implementasi saat ini.

Hasil terbaru masih belum sesuai dengan konsep utama proyek.

Masalah utamanya:
- Dunia masih terasa seperti satu pulau kecil yang dipadatkan.
- Belum terasa seperti **negara** dengan hirarki wilayah.
- Demo City masih terlihat seperti permukiman/pulau kehidupan, bukan struktur negara.
- Kawasan ibu kota, provinsi, kabupaten/kota, desa/kampung belum memiliki identitas visual dan tata ruang yang berbeda.
- Beberapa rumah terlalu dekat bahkan seperti menempel ke jalan aspal.
- Mode grafik High belum terasa benar kualitasnya, terutama shadow dan visual depth.
- Hewan yang ada masih terlalu placeholder/shape, bukan aset hewan yang proper dengan animasi.

Saya ingin kamu mengubah arah implementasi berikutnya secara tegas.

## 1. Ubah fokus dari “satu Demo City padat” menjadi “struktur negara”

Jangan hanya memadatkan pulau yang sama.

Saya ingin beberapa **fixture demo terpisah** yang mewakili jenis wilayah berbeda, agar AI Nation Builder benar-benar terasa sebagai nation builder.

Minimal sediakan fixture demo berikut:
1. **Capital Region / Ibu Kota Negara**
2. **Provincial Capital / Pusat Provinsi**
3. **Kabupaten / Kota Menengah**
4. **Desa / Kampung**
5. **Kawasan Pesisir / Waterfront**
6. **AI Construction Lab** untuk Phase 6 lokal

Semua fixture harus memakai renderer, HUD, dan engine yang sama, tetapi memiliki komposisi wilayah yang berbeda.

## 2. Buat hirarki wilayah yang jelas

Setiap jenis wilayah harus punya identitas tersendiri.

### Ibu kota negara
- paling padat
- pusat pemerintahan utama
- plaza
- bangunan landmark
- jalan utama lebih lebar
- aktivitas lebih tinggi
- kawasan komersial dan publik

### Pusat provinsi
- padat sedang
- pemerintahan daerah
- permukiman teratur
- jalan kolektor
- fasilitas umum

### Kabupaten / kota
- campuran hunian dan komersial ringan
- kepadatan menengah
- identitas lokal

### Desa / kampung
- lebih renggang
- vegetasi dominan
- jalan kecil
- rumah lebih sederhana
- suasana rural

### Kawasan pesisir
- waterfront
- promenade atau area tepi laut
- vegetasi pesisir
- aktivitas khas pesisir

Saya tidak ingin semua wilayah terasa seperti versi berbeda dari kota yang sama.

## 3. Perbaiki tata ruang dan setback bangunan

Bangunan tidak boleh terlihat menempel ke jalan.

Terapkan aturan visual yang lebih benar:
- setback dari jalan
- trotoar
- halaman depan
- pagar atau batas kavling
- akses masuk
- area parkir sederhana bila sesuai

Audit seluruh rumah, bangunan publik, dan bangunan lain agar hubungan antara bangunan dan jalan lebih realistis.

## 4. Perbaiki sistem jalan berdasarkan hirarki

Saya ingin perbedaan visual antara:
- jalan utama
- jalan kolektor
- jalan lokal
- jalan desa

Tambahkan visual yang sesuai:
- trotoar
- curb
- zebra cross
- lampu jalan
- bahu jalan bila perlu
- persimpangan yang lebih natural

Jangan semua jalan terasa identik.

## 5. High graphics harus benar-benar high

Mode kualitas visual harus nyata.

Periksa:
- shadow
- arah cahaya
- ketajaman / softness shadow
- tone mapping
- visual depth
- atmospheric haze
- material quality

Jika quality preset High dipilih, hasil visualnya harus jelas berbeda dari Medium/Low.

Jangan hanya mengganti label atau sedikit parameter.

## 6. Terrain dan atmosfer

Saya ingin terrain lebih jelas dan bukan bidang kosong.

Perbaiki:
- kontur
- elevasi
- transisi rumput, tanah, pasir
- shoreline
- pesisir
- laut
- awan
- atmosfer
- horizon depth

Dunia harus terasa seperti wilayah nyata yang punya bentuk geografis, bukan hanya pulau datar dengan aset di atasnya.

## 7. Hewan harus diganti dengan aset yang layak

Saya tidak ingin hewan berbentuk placeholder/shape.

Gunakan aset hewan yang proper dan punya animasi dasar.

Prioritas:
- burung
- burung pantai
- ayam
- kambing
- kucing / anjing

Tempatkan sesuai wilayah:
- desa / kampung
- pesisir
- permukiman

Jangan terlalu banyak. Tetap efisien dan relevan.

## 8. Phase 6 boleh mulai, tetapi fokusnya harus benar

Saya setuju Phase 6 dimulai sekarang, tetapi **lokal/offline saja**.

Namun Phase 6 tidak boleh sekadar “AI menambah bangunan”.

Saya ingin Phase 6 berfokus pada:

### AI Regional Planning
AI harus dapat merencanakan wilayah sesuai jenis:
- ibu kota
- pusat provinsi
- kabupaten/kota
- desa/kampung
- pesisir

### District Growth Logic
Setiap wilayah tumbuh dengan pola yang berbeda.

### Construction Stages
Pembangunan bertahap:
- survey
- penandaan
- konstruksi awal
- setengah jadi
- selesai

### AI Build Commands
Contoh:
- bangun pusat provinsi
- bangun desa pesisir
- kembangkan kabupaten
- bangun kawasan pemerintahan
- bangun kawasan hunian sedang

### Demo Construction Fixtures
Harus ada fixture demo terpisah yang menunjukkan proses pembangunan wilayah bertahap, tanpa menyentuh database permanen.

## 9. Data safety

Tetap pertahankan:
- 25 tabel
- 32 objek permanen
- revisi 0 dunia permanen
- seluruh fixture demo tetap terisolasi
- jangan ada data demo yang masuk ke SQLite permanen

## 10. Deliverables yang saya inginkan

Saya ingin hasil berikut:
1. Fixture demo Capital Region
2. Fixture demo Pusat Provinsi
3. Fixture demo Kabupaten/Kota
4. Fixture demo Desa/Kampung
5. Fixture demo Pesisir
6. Perbaikan setback bangunan terhadap jalan
7. Perbaikan quality preset High
8. Terrain dan atmosfer yang lebih jelas
9. Hewan dengan aset yang proper dan animasi dasar
10. Fondasi Phase 6 lokal yang benar-benar menunjukkan AI regional planning dan construction stages
11. Screenshot dan rekaman gameplay dari masing-masing fixture
12. Laporan:
   - `docs/PHASE_5C_NATION_HIERARCHY_REPORT.md`
   - `docs/PHASE_6_LOCAL_PLANNING_REPORT.md`

Jangan aktifkan Railway/AWS berbayar.
Jangan merge tanpa review saya.
Jangan melanjutkan video generator dulu.

Target saya sekarang adalah:
**AI Nation Builder harus mulai terasa seperti simulator pembangunan negara dengan banyak tingkat wilayah, bukan hanya satu pulau permukiman yang dipadatkan.**