Lanjutkan pengembangan AI Nation Builder dari source terbaru Phase 5C.

Saya ingin **melanjutkan refinement visual** sekaligus **memulai Phase 6 secara lokal/offline**, tanpa deployment berbayar terlebih dahulu.

Jangan aktifkan Railway/AWS berbayar. Fokuskan pekerjaan pada kualitas dunia, struktur perkembangan wilayah, dan sistem pembangunan AI.

## A. Refinement visual lanjutan

Tampilan sekarang sudah jauh lebih baik, tetapi masih terasa:
- kurang padat
- kurang teratur
- belum terasa seperti negara dengan hirarki wilayah
- belum cukup hidup secara atmosfer
- terrain dan lingkungan belum cukup jelas

Saya ingin perbaikan berikut:

### 1. Hierarki perkembangan wilayah
Bangun logika visual dan tata ruang berdasarkan tingkat wilayah:

- **Pusat negara / ibu kota**
  - paling padat
  - landmark pemerintahan utama
  - plaza
  - jalan besar
  - fasilitas publik lengkap
  - aktivitas warga dan kendaraan tinggi

- **Pusat provinsi**
  - cukup padat
  - kantor pemerintahan daerah
  - area permukiman lebih teratur
  - fasilitas umum
  - jalan kolektor

- **Kabupaten / kota**
  - kepadatan sedang
  - kawasan hunian, pasar/ruko, klinik, taman kecil

- **Desa / perkampungan**
  - lebih renggang
  - rumah menyebar
  - vegetasi lebih dominan
  - jalan lebih kecil
  - suasana rural

Saya tidak ingin semua wilayah dipadatkan secara merata. Kepadatan harus mengikuti fungsi wilayah.

### 2. Kepadatan kota yang lebih baik
Perbaiki Demo City agar tidak terasa seperti rumah-rumah berjauhan di lahan kosong.

Tambahkan elemen:
- blok permukiman yang lebih masuk akal
- taman
- area komersial kecil
- area publik
- jalur pedestrian
- parkir
- fasilitas umum
- transisi antar distrik

Gunakan tata ruang yang lebih hidup dan meyakinkan.

### 3. Terrain dan lingkungan
Perjelas lingkungan dengan:
- bentuk terrain yang lebih terbaca
- perbukitan
- dataran
- pesisir
- transisi rumput, tanah, pasir
- laut yang lebih hidup
- shoreline yang lebih baik
- elemen atmosfer

### 4. Sky & atmosphere
Tambahkan:
- awan
- langit yang lebih hidup
- atmospheric depth / haze ringan
- suasana tropis semi-realistis

Jangan berlebihan sehingga mengganggu performa browser.

### 5. Fauna / hewan
Tambahkan hewan yang sesuai wilayah dan skala, misalnya:
- burung
- burung pantai
- ayam / kambing di perkampungan
- kucing / anjing di area permukiman

Hewan harus menjadi elemen hidup tambahan, bukan fokus utama.

Gunakan populasi kecil dan efisien. Jangan mengganggu performa.

### 6. Scale consistency
Audit kembali ukuran:
- bangunan
- karakter Chibi
- kendaraan
- pohon
- hewan
- jalan
- trotoar
- lampu jalan

Pastikan semuanya lebih serasi untuk arah semi-realistis.

## B. Mulai Phase 6 secara lokal
Saya ingin **Phase 6 mulai dikerjakan sekarang**, tetapi **hanya secara lokal/offline**.

### Phase 6: AI Builder & Construction System

Tujuan:
Membuat negara berkembang secara bertahap melalui sistem AI, bukan sekadar menaruh bangunan jadi.

Implementasikan fondasi berikut:

#### 1. AI Regional Planning
AI dapat merencanakan pembangunan wilayah berdasarkan tipe:
- ibu kota
- pusat provinsi
- kabupaten/kota
- desa/perkampungan
- kawasan pesisir
- kawasan hijau

AI menentukan:
- pola jalan
- zona permukiman
- area pemerintahan
- area komersial
- ruang publik
- fasilitas umum
- vegetasi

#### 2. District Growth Logic
Buat aturan perkembangan bertingkat:
- pusat negara tumbuh paling kompleks
- provinsi tumbuh sedang
- kabupaten lebih sederhana
- desa tetap lebih rural dan renggang

Gunakan logika perkembangan yang masuk akal, bukan random placement.

#### 3. Construction Stages
Pembangunan harus memiliki tahap:
- survey / penandaan lahan
- konstruksi awal
- bangunan setengah jadi
- selesai

Tambahkan elemen visual seperti:
- pembatas area
- kendaraan konstruksi
- alat konstruksi
- bangunan under construction

Jangan semua bangunan langsung jadi instan.

#### 4. AI Build Commands
Siapkan perintah dasar untuk AI builder, misalnya:
- bangun pusat provinsi
- kembangkan kabupaten
- buat perkampungan pesisir
- bangun kawasan pemerintahan
- bangun area hunian sedang
- tambah fasilitas umum

Belum perlu video generator penuh pada tahap ini.

#### 5. Demo Construction Scenario
Buat skenario demo terisolasi untuk memperlihatkan:
- AI merencanakan wilayah
- jalan muncul bertahap
- bangunan dibangun bertahap
- distrik mulai terbentuk
- NPC dan kendaraan menyesuaikan

Skenario ini tidak boleh merusak database permanen.

## C. Data safety
Tetap pertahankan:
- 25 tabel
- 32 objek asli
- revisi 0 dunia permanen
- fixture demo tetap terisolasi
- jangan tulis data demo ke database permanen

## D. Testing
Lakukan:
- build
- test
- regresi Phase 1–5C
- uji Demo City
- uji skenario AI construction
- uji performa
- uji bahwa demo/fase 6 tidak mengubah world permanen

## E. Deliverables
Saya ingin:
1. Demo City yang lebih padat dan lebih terstruktur.
2. Lingkungan semi-realistis yang lebih hidup.
3. Awan dan atmosfer.
4. Hewan sesuai wilayah.
5. Skala aset yang lebih konsisten.
6. Fondasi Phase 6 AI Builder & Construction berjalan lokal.
7. Demo skenario pembangunan bertahap.
8. Screenshot dan rekaman dari aplikasi nyata.
9. Laporan:
   - `docs/PHASE_5C_REFINEMENT_REPORT.md`
   - `docs/PHASE_6_AI_BUILDER_FOUNDATION_REPORT.md`

Jangan aktifkan hosting berbayar.
Jangan merge tanpa review saya.
Jangan mulai video generator penuh dulu.
Fokus pada refinement dunia dan fondasi AI construction.