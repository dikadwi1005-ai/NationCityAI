# Phase 6 — AI Builder & Construction Foundation (lokal/offline)

Implementasi fondasi dimulai atas instruksi pemilik terbaru. Basis source Phase 5C Pass 3 `0f39194eb7309c50c1f26777db54487c15b00be1`; checkpoint sebelum perubahan dipertahankan. Tidak ada aktivasi layanan berbayar atau video generator penuh.

## Cara mencoba

1. Jalankan server lokal, lalu buka http://localhost:3000/demo-construction.
2. Pilih/ketik perintah, lalu **Rencanakan wilayah**. Secara default ini memulai skenario lokal baru.
3. Periksa footprint valid dan ringkasan tapak ditolak. Tekan **Mulai konstruksi**, pilih kecepatan 1×/4×/12×, atau gunakan **Langkah 15 detik**.
4. Gunakan **Fokus tapak** untuk melihat konstruksi dekat dan **Ikhtisar wilayah** untuk kembali.
5. Setelah tahap selesai, centang **Kembangkan hasil skenario** untuk merencanakan wilayah berikut sambil mempertahankan objek selesai dan menyambungkan jalan lama.
6. Gunakan tautan kembali ke dunia permanen. Reload menghapus progres demo; tidak ada penyalinan demo ke SQLite.

Menu utama yang sudah ada juga menyediakan tautan ke lab. Katalog manual/terrain mutation dikunci pada skenario agar tidak bertabrakan dengan scheduler. Editor dunia permanen dan Demo City normal tetap memakai alur sebelumnya.

## Planner wilayah

`packages/ai-builder/planning.ts` adalah modul murni, bounded dan deterministik. Tidak mengimpor persistence, socket, credential atau layanan model. Ini **planner berbasis aturan lokal**, bukan integrasi LLM atau AI otonom production.

| Profil | Target maksimum rumah | Tim paralel logis | Pola |
| --- | ---: | ---: | --- |
| Ibu kota | 64 | 4 | Grid utama/kolektor rapat, landmark dan fasilitas |
| Pusat provinsi | 32 | 3 | Kolektor, pusat layanan dan permukiman teratur |
| Kabupaten/kota | 20 | 2 | Hunian sedang, fasilitas dan niaga |
| Desa | 8 | 1 | Frontage renggang, sabuk hijau lebih dominan |
| Pesisir | 14 | 2 | Profil pesisir dengan penolakan tapak air |
| Kawasan hijau | 0 | 1 | Park dan vegetasi, tanpa hunian |

Angka adalah batas target, bukan jaminan semua lahan layak. Parser mendukung bangun ibu kota/pusat provinsi, kembangkan kabupaten, buat perkampungan pesisir/desa, kawasan pemerintahan, hunian sedang, fasilitas umum dan kawasan hijau. Input tidak dikenal ditolak; tidak dieksekusi sebagai kode/shell.

Planner menghasilkan proposal jalan, hunian, pemerintahan, niaga, ruang publik dan vegetasi. Semua target domain melewati `placementError` dan shared reducer; fixture niaga diperiksa collision, air, slope dan akses jalan. Footprint preview hanya menampilkan target yang diterima, sehingga zona indikatif tidak dianggap sebagai izin membangun di laut.

Road growth memakai pencarian sambungan bertahap ke jaringan lama. ID, transformasi dan geo objek lama dipertahankan. Profil baru dapat mereferensikan parent role yang sesuai; avenue lama dipertahankan. Parent ini adalah metadata planning, bukan penetapan otoritas pemerintah.

## Scheduler dan renderer

Setiap job mempunyai ID deterministik, dependency, durasi dan stage. Road job menunggu segmen penghubung; bangunan/fasilitas menunggu akses road. Jumlah job aktif dibatasi profil. Tim adalah slot scheduler, bukan akun warga/tenaga kerja ekonomi.

Tahapan nyata:
- Survey: stake dan batas lahan.
- Konstruksi awal: grading/foundation, pembatas, kendaraan konstruksi lokal.
- Setengah jadi: slab, kolom, sebagian dinding dan crane; jalan memakai gravel/asphalt bertahap.
- Selesai: objek baru dimasukkan ke world **in-memory** melalui reducer; renderer aset normal mengambil alih.

Waktu 3–16 detik per job adalah waktu simulasi demo yang dipercepat, bukan durasi konstruksi fisik. Pause tidak mengubah waktu/progres. Vegetasi presentasi menghindari tapak rencana; object domain yang belum selesai tidak masuk world. NPC dan kendaraan membaca topology objek selesai sehingga goals, jalan dan aktivitas menyesuaikan. Fauna juga hanya memakai habitat yang tersedia.

Katalog domain tetap enam aset. Niaga/fasilitas tambahan tetap ditandai sebagai fixture dan tidak dipromosikan menjadi aset buildable utama. Tidak ada perubahan auth, voting, chat, server collision, tabel atau migrasi database.

## Hasil pengujian

49 tes unit/domain dan build/typecheck lulus. Skenario provinsi menyelesaikan **114/114 pekerjaan** menjadi 113 objek domain dan satu fixture niaga, dalam sekitar 202 detik simulasi. Browser memverifikasi pause, seluruh stage, fokus frame, zoom round-trip, ekspansi yang mempertahankan hasil lama, resource cycles dan mobile. Seluruh 25 signature tabel permanen tidak berubah. Bench lengkap ada di laporan refinement dan browser-verification.json.

Tes domain mencakup determinisme, immutability, target collision/terrain, dependency order, semua profil sampai selesai, tahap perantara, input/waktu invalid, hirarki dan ekspansi dengan ID lama tetap sama. Acceptance browser memeriksa job benar-benar melewati tahap, pause, command invalid, kamera, hasil lengkap, perencanaan pertumbuhan lanjutan, resource, mobile dan nol request API dari demo.

Regresi lama meliputi placement/terrain/undo/redo/restart, HUD/katalog, Living World, creator/multiplayer/joystick/travel/reconnect, proximity chat, government/election, PostgreSQL 18.6 TCP dan HTTPS/WSS lokal, migrasi serta encrypted/S3-stub recovery. S3 tetap stub; belum ada pengujian bucket cloud nyata.

## Data dan bukti

Backup konsisten terenkripsi sebelum perubahan telah di-restore dan dibandingkan pada file terpisah. Audit sebelum/sesudah memakai mode read-only, tanpa membuat atau menginisialisasi database. **25 tabel, 32 ID/koordinat objek asli dan revisi 0 dunia permanen tetap sama**. Demo/AI tidak membuat warga, vote, chat atau statistik multiplayer asli.

Evidence `docs/phase6-local`: construction-blueprint, construction-survey, construction-foundation, construction-frame, construction-site-close, building-frame-close, construction-growing, construction-complete, regional-growth-plan, coastal-plan dan mobile-builder. Video `ai-construction-gameplay.webm` merekam sekitar 9 detik canvas asli ketika pembangunan, kamera, NPC/traffic bergerak. Ini rekaman QA, bukan fitur video generator.

## Batas fondasi

Progres/job/region tidak dipersistensikan, tidak disinkronkan multiplayer dan tidak memiliki recovery queue production. Belum ada ekonomi, kebutuhan material, dana, tenaga kerja, persetujuan pemerintah atau model AI eksternal. Geometri konstruksi generik, belum model pekerjaan/BIM per varian. Crane/kendaraan kerja adalah prop; nav/collision utama mengikuti objek selesai, sehingga pagar dan tapak aktif belum menjadi obstacle fisik penuh. Placement memakai grid dan collider lama; jendela routing lokal dan traffic tidak dijamin deadlock-free. Growth berhenti/reject ketika tanah tidak layak atau batas 2000 objek domain tercapai; tidak otomatis mereset pulau atau mengubah geography.

Performa diukur pada satu desktop; mobile hanya emulasi, long soak dan skala negara penuh belum diuji. Cloud hosting/backup nyata tetap ditunda. Perubahan disiapkan sebagai draft review lanjutan dari source Phase 5C; tidak di-merge atau di-deploy.
