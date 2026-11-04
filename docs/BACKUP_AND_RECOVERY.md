# Backup privat dan pemulihan

GitHub menyimpan source, dokumentasi, konfigurasi contoh dan tes. Simpan database, ekspor SQL privat, arsip, kunci serta kredensial di luar checkout. Jalankan perintah berikut dari root proyek dengan Node 24+ dan akun OS pengelola. Gunakan WORLD_DATA_DIR absolut yang sama dengan proses web dan multiplayer. Untuk CLI, ekspor variabel ke proses atau gunakan node --env-file=apps/web/.env.local sebelum nama skrip.

## Operasi rutin

| Tugas | Cara |
|---|---|
| Backup manual | `node scripts/recovery.mjs backup` atau masuk admin, buka Pemerintahan → Backup & Pemulihan → Buat backup privat |
| Jadwal | npm start dan npm run dev menjalankan worker watch. Untuk service terpisah jalankan `node scripts/recovery.mjs watch`. Gunakan satu scheduler per database. |
| Pemeriksaan sekali | `node scripts/recovery.mjs tick` |
| Status | /pemulihan menampilkan waktu, schema, ukuran, integritas, hasil remote dan audit. Endpoint memerlukan cookie admin. |

Snapshot menggunakan VACUUM INTO dari koneksi terpisah, termasuk state committed pada WAL. Backup tambahan dibuat sebelum migrasi schema pemerintahan v5. ID backup berupa UUID. Salinan sementara berada di direktori privat lalu diperiksa dengan integrity_check dan foreign_key_check. Arsip lokal dienkripsi dengan AES-256-GCM, IV acak dan ID arsip sebagai authenticated data. Manifest mencatat SHA-256 ciphertext. Restore memverifikasi checksum, tag GCM dan integritas SQLite.

Backup melindungi hash kredensial warga, karakter, domisili, pemilu dan dunia. Token sesi serta tiket bermain dikeluarkan. Salinan bukti laporan dan audit yang tinggal kurang dari tiga hari sebelum expiry dikeluarkan juga. Backup yang menyertakan bukti diberi batas berdasarkan tanggal kedaluwarsa terawal. Worker aktif menerapkan retensi; file offline atau salinan tambahan memerlukan penghapusan oleh operator. File parsial akibat penghentian paksa berpotensi berisi plaintext. Setelah memastikan tidak ada pekerjaan backup aktif, periksa dan bersihkan file .partial melalui akun operator.

## Konfigurasi dan kunci

- WORLD_DATA_DIR berisi nation.sqlite. BACKUP_DIR harus di luar direktori data, web publik dan checkout. Default data biasa memakai folder .nation-private di profil OS, dipisahkan berdasarkan path sumber.
- Atur ACL hanya untuk identitas layanan dan administrator. Pada Windows verifikasi NTFS ACL direktori vault, direktori induk dan file kunci. Hak POSIX yang diberikan saat pembuatan file tidak menggantikan ACL Windows.
- BACKUP_KEY adalah 32 byte acak dalam Base64, dipasok lewat secret manager atau environment server. Jika tidak diisi, backup lokal membuat file kunci privat di samping direktori vault dengan akhiran .recovery.key. Remote memerlukan BACKUP_KEY eksplisit. Simpan salinan kunci secara terpisah dalam pengelola rahasia yang memiliki recovery access. Kehilangan kunci membuat arsip tidak dapat dipulihkan. Pertahankan versi lama saat rotasi, dan uji kunci dengan restore ke file baru.
- BACKUP_INTERVAL_HOURS default 24 dan BACKUP_POLL_SECONDS default 60. BACKUP_DAILY, BACKUP_WEEKLY dan BACKUP_MONTHLY default 7, 4 dan 3. Retensi memilih sampel terbaru pada bucket hari, minggu dan bulan; satu sampel bisa memenuhi beberapa kategori. Snapshot pra-migrasi terbaru juga dipertahankan selama belum melewati expiry bukti. Retensi dijalankan sesudah backup sukses. Kegagalan backup manual tidak menggantikan backup terakhir.
- Bila worker berhenti, tidak ada backup terjadwal sampai worker berjalan kembali. Pantau umur snapshot dan kegagalan upload melalui audit. Snapshot dibaca ke memori untuk enkripsi; ukur pemakaian RAM/disk dan latensi penulisan sebelum menerapkan pada database besar.

## Salinan privat di luar host

Adapter menggunakan AWS S3 melalui HTTPS. Siapkan AWS_REGION, BACKUP_S3_BUCKET, BACKUP_KEY, dan role IAM server. Bucket khusus harus memblokir empat kategori akses publik, memakai BucketOwnerEnforced, tanpa versioning, serta lifecycle expiration satu hari untuk prefix nation-backups/. Kebijakan anonim ditolak. Periode pendek remote membatasi umur salinan bukti moderasi; retensi berjenjang menggunakan vault lokal. Pantau cakupan backup jika interval upload mendekati atau melebihi masa simpan remote.

Batasi role ke pemeriksaan konfigurasi bucket serta PutObject/GetObject pada prefix tersebut. Simpan log akses bucket sesuai kebijakan operator. Tidak ada URL unduh di aplikasi. SDK mengirim ciphertext beserta checksum, lalu membaca objek kembali dan menghitung SHA-256. Status terverifikasi hanya diberikan setelah perbandingan berhasil. Jika upload gagal, periksa IAM, konfigurasi dan audit, kemudian jalankan backup manual. Tanpa bucket, statusnya belum aktif. Satu vault di mesin yang sama tidak melindungi dari hilangnya mesin.

## Latihan pemulihan

1. Pilih ID dari panel atau manifest, identifikasi kunci yang benar, dan siapkan direktori staging privat yang berbeda dari direktori aktif. Target harus belum ada. Jangan tempel kunci ke chat, log atau command line.
2. Untuk arsip lokal jalankan `node scripts/recovery.mjs restore ID PATH_BARU --confirm-new-file`. Untuk objek S3 gunakan `node scripts/recovery.mjs restore-remote ID PATH_BARU --confirm-new-file`. Pemulihan remote memerlukan ID, bucket, akses IAM, kunci dan konfigurasi yang sesuai; simpan inventaris ID terpisah dari host utama.
3. Buka hasil sebagai database staging. Bandingkan revision, jumlah dan ID objek, posisi, karakter, masa jabatan, hasil pemilu dan audit. Tes login ulang dengan akun staging. Jangan memulai dua dunia aktif pada data yang sama.
4. Untuk cutover produksi, minta persetujuan administrator, hentikan web, multiplayer dan worker, lalu pastikan seluruh penulis berhenti. Buat backup pengaman jika sumber masih terbaca. Pertahankan direktori lama, tempatkan hasil verifikasi sebagai nation.sqlite di direktori baru, arahkan WORLD_DATA_DIR ke sana, dan mulai layanan. CLI tidak menimpa database aktif. Jika verifikasi pascacutover gagal, hentikan penulisan sebelum kembali ke direktori lama; rekonsiliasi tulisan baru sebelum rollback.

## PostgreSQL

Gunakan database dan role berbeda untuk development, staging dan production. Jalankan ekspor SQLite konsisten ke staging PostgreSQL, lalu validasi ID, FK, eligibility, participation, agregat ballot dan event. Berkas ekspor dapat memuat hash kredensial dan surat suara; kelola sebagai data privat. Pada runtime PostgreSQL kelak, gunakan pg_dump format custom dan pg_restore ke database kosong untuk latihan logis. Untuk PITR dibutuhkan base backup dan rangkaian WAL atau fasilitas setara dari penyedia. Periksa paket, masa retensi, target waktu dan uji restore aktual. [Dokumentasi pg_dump](https://www.postgresql.org/docs/current/backup-dump.html) · [PITR PostgreSQL](https://www.postgresql.org/docs/current/continuous-archiving.html)

Pengujian saat ini mencakup staging PostgreSQL lokal dan kontrak S3 dengan stub. Upload, restore di AWS nyata, PITR hosted, pemulihan saat host hilang dan target RPO/RTO produksi belum diverifikasi.
