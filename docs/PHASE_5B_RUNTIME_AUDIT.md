# Audit runtime dan kesiapan Phase 5B

Tanggal: **4 November 2026, WIB**. Status: lokal terverifikasi; deployment internet dan backup cloud belum terverifikasi. Phase 6 tidak dimulai. Tidak ada layanan berbayar, database cloud, bucket, atau domain publik yang dibuat.

Pembaruan keputusan sesudah audit: pemilik telah memilih dunia awal permanen ini sebagai sumber beta. Pemilihan sumber bukan lagi gate terbuka. Lihat [rencana peluncuran terbaru](CLOSED_BETA_LAUNCH_PLAN.md) untuk rekonsiliasi GitHub, region Singapore dan persetujuan biaya.

## Database yang benar-benar aktif

Sumber yang diperiksa: `D:\Web Project\Nation City\data\nation.sqlite`. Respons lengkap `/api/world` pada localhost cocok dengan state di file tersebut, termasuk ID, seluruh objek dan revisi. Web serta Colyseus berjalan melalui launcher lokal yang sama dan memakai direktori data absolut ini.

| Temuan | Nilai |
|---|---|
| Waktu pembuatan file menurut NTFS | 4 November 2026, 01.59.29 WIB |
| Sifat file | persisten di disk, SQLite WAL; bukan database in-memory atau file sementara tes |
| Kondisi data | **dunia awal hasil inisialisasi**, bukan bukti data lama pengguna |
| Dunia | 1, revisi 0, terrain version 1 |
| Objek | 32; identik dengan starter bawaan, setelah normalisasi penambahan `geo.strokes=[]` dari migrasi v2 |
| Stroke atlas / world_events | 0 / 0 |
| Warga / penampilan / pemilu / masa jabatan / usulan | seluruhnya 0 |
| Wilayah pemerintahan | 1 wilayah nasional bawaan |
| Chunk terrain | 24 |
| Schema SQLite | 25 tabel; versi migrasi 1, 2 dan 5 |
| Kelengkapan | semua 23 tabel arsip persisten + 2 tabel sesi/tiket tersedia; 2 view dan 5 index aplikasi tersedia |
| Pemeriksaan integritas | `integrity_check=ok`, 0 pelanggaran foreign key |

Main file pada audit awal hanya 4096 byte, tetapi WAL memuat sekitar 651 KB. Menyalin main file saja saat runtime hidup tidak merupakan backup yang benar. Ukuran main/WAL dapat berubah saat checkpoint tanpa perubahan isi dunia.

Timestamp file bukan bukti asal-usul mutlak, tetapi kecocokan penuh dengan starter, revisi 0 dan ketiadaan seluruh histori mendukung kesimpulan seed-only. Tidak ada database lama otoritatif lain yang ditemukan di checkout ini. Tidak dilakukan pencarian menyeluruh terhadap seluruh disk. Backup terjadwal di vault juga berasal dari runtime lokal saat ini, bukan bukti arsip historis pengguna. Pemilik perlu memilih sumber sebelum cutover cloud.

## Backup sebelum perubahan

Sebelum perubahan kode migrasi, snapshot konsisten diambil dengan `VACUUM INTO` melalui koneksi read-only. Arsip dienkripsi AES-256-GCM dan dipulihkan ke file lain; database asli tidak diganti.

- ID, lokasi vault dan SHA-256 ciphertext disimpan dalam laporan mesin operator lokal yang dikecualikan dari Git.
- Arsip terenkripsi: 258076 byte.
- Jumlah baris dan signature **seluruh 25 tabel** hasil restore identik dengan sumber. Pada dataset ini tidak ada sesi/tiket atau bukti mendekati expiry yang perlu dibuang oleh kebijakan backup.
- ACL vault dan file kunci diperiksa: akses diwariskan hanya untuk user8, SYSTEM, dan Administrators. Isi kunci tidak ditampilkan.
- Signature sumber kembali dibandingkan setelah seluruh rangkaian pengujian dan restart; tetap sama. Tidak ada migrasi yang perlu diterapkan ke SQLite aktif.

Laporan mesin `phase5b-runtime-audit.json` tersimpan lokal dan tidak dipublikasikan. File restore plaintext berada dalam vault privat untuk verifikasi; tidak termasuk source atau paket deployment. Backup ini melindungi perubahan lokal, tetapi belum melindungi kehilangan mesin karena belum ada salinan S3 nyata.

## Integrasi dan pengujian

| Cakupan | Bukti dan hasil |
|---|---|
| Runtime localhost aktual | Edge: dunia sama persis dengan SQLite; login admin dan cookie HttpOnly; atlas/panduan; halaman warga, pemerintah, moderasi dan pemulihan; seluruh read API terkait; anonymous admin dan origin asing ditolak; multiplayer health 200; 0 browser error. PASS |
| Phase 1–2 | Tes browser produksi: penempatan rumah (18,12), ACK, refresh, mesh dengan ID sama; preview atlas tanpa commit, pulau, sculpt, undo/redo, ikhtisar dan restart. PASS |
| Phase 3 | Dua akun: karakter, persistensi, gerakan peer, collision, perjalanan Sagara, reconnect, logout/login, penolakan akses admin. PASS |
| Phase 4 | Tiga akun: chat dekat/jauh, lintas batas sel/wilayah, isolasi frame, block/mute/report/sanction, HTML, spoof, replay/rate limit, reconnect. PASS setelah koreksi tes cooldown perjalanan |
| Phase 5 | Browser: pencalonan, review, voting, suara paralel 200/400, penolakan warga luar, hasil 2:1, finalisasi idempotent, titel/seragam/gestur dan akses kantor, penolakan akses platform, backup panel. Domain: domisili, deadline, rollback, expiry jabatan, usulan dan restore. PASS |
| Migrasi sumber aktual | Snapshot konsisten dari SQLite yang disebutkan diimpor ke PostgreSQL native **18.6 lokal**; semua 23 tabel diperiksa jumlah/signature oleh importer; state dan event identik; role runtime membaca hasil; schema 51 hadir; target yang sudah terisi ditolak; sumber tidak berubah. PASS |
| Closed beta PostgreSQL | Akun di luar allowlist, undangan salah/username lain ditolak; alur PostgreSQL lintas proses; HTTPS/WSS loopback dan Secure cookie; emulasi sentuh 390×844, chat, travel, reconnect, voting; restore logis ke database kedua. PASS |
| S3 | Tes kontrak stub menolak bucket publik dan GET korup; enkripsi, checksum baca-balik, restore fresh-vault. PASS **tanpa jaringan cloud** |
| Pemeriksaan akhir | 29/29 tes unit, typecheck, dan build produksi berhasil. Localhost dinyalakan kembali dengan build final. |

Smoke runtime aktual bersifat read-only terhadap data game. Alur mutasi multi-user dijalankan terhadap fixture terisolasi, bukan dengan memasukkan warga/pemilu uji ke sumber aktif. Bukti tersebut tidak boleh disamakan dengan uji beta internet pada data pengguna. Laporan mesin runtime aktual `phase5b-live-smoke.json` tersimpan lokal dan dikecualikan dari Git.

Nomor versi 3/4 tidak tercatat sebagai baris migrasi karena tabel warga/chat diinisialisasi idempotently oleh modul masing-masing; kelengkapan diperiksa langsung. Versi **51 hanya untuk PostgreSQL** dan bukan migrasi SQLite yang tertinggal.

## Perubahan yang diselesaikan

1. `scripts/audit-sqlite.mjs` membuka sumber yang sudah ada secara read-only; menolak membuat file baru, mendeteksi starter dan memeriksa kelengkapan, integritas, jumlah serta signature tanpa menampilkan isi privat.
2. Jalur `staging-migrate.mjs` sekarang menolak sumber dengan tabel/versi tidak lengkap atau tabel tak terpetakan. Dunia seed memerlukan pilihan eksplisit `--allow-seed-source`. Operator wajib mengonfirmasi pembekuan penulis melalui `MIGRATION_WRITES_FROZEN=true`. Backup pra-migrasi diberi reason yang dipertahankan kebijakan retensi.
3. `scripts/migration-rehearsal.mjs` menguji sumber aktual terhadap PostgreSQL native lokal tanpa menulis atau menghapus SQLite asal. Runtime PostgreSQL menolak target yang sudah mempunyai schema import.
4. `scripts/verify-s3-backup.mjs` disiapkan untuk bucket yang sudah ada: encrypted PUT → GET dan SHA-256 → restore dari vault baru → perbandingan signature semua tabel. Memerlukan konfigurasi operator dan `--confirm-upload`; **belum dijalankan terhadap AWS nyata**. Template IAM dan lifecycle disediakan.
5. Panduan Railway diperbarui mengikuti dokumentasi provider saat ini. TOML lama diberi label legacy; BOM UTF-8 dihilangkan. Untuk layanan baru tersedia matriks dashboard, pemisahan variabel/secret dan urutan migrasi. Tidak ada konfigurasi provider yang diterapkan.
6. Panduan dan label di UI diperbarui dari Phase 2 menjadi Phase 5 agar tidak lagi mengklaim multiplayer/pemilu belum aktif.
7. Tes chat diperbaiki agar menghormati cooldown perjalanan server 1200 ms; uji balik semula dilakukan terlalu cepat. Perilaku otorisasi/radius chat tidak diubah.

## Gate yang masih terbuka

- Pemilik memilih dunia awal ini untuk beta atau menentukan lokasi database lama yang otoritatif.
- Plugin Railway tersedia tetapi belum terpasang/terhubung; workspace dan environment belum dipilih. AWS credentials belum disiapkan untuk verifikasi.
- Batas biaya, provisioning PostgreSQL/service/bucket serta publikasi perlu persetujuan pemilik. Tidak ada layanan berbayar diaktifkan.
- Checkout tidak memiliki `.git`; revisi lokal belum dapat dianggap telah dipush ke repository deployment. Source yang diuji harus dipublikasikan lewat checkout Git yang benar sebelum autodeploy.
- Engine Docker lokal tidak tersedia; upaya menyalakannya tidak menghasilkan endpoint engine, dan klien startup yang menunggu dihentikan. Image Linux/Dockerfile belum dibangun; perlu build di mesin Docker yang siap atau di Railway setelah disetujui.
- Tidak ada PUT/GET atau restore AWS S3 nyata, migrasi ke PostgreSQL Railway, sertifikat publik, URL beta online, pengujian dua perangkat/jaringan internet, monitoring cloud, atau restore disaster-recovery hosted yang diklaim selesai.

Langkah akun, variabel per layanan, perintah migrasi/restore, serta urutan membuka beta ada di [panduan deployment](../deploy/railway/README.md). Panduan terbaru ini menggantikan bagian status sumber dan konfigurasi TOML pada laporan Phase 5B sebelumnya.
