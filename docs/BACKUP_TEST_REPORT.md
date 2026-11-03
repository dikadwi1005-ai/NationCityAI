# Hasil pengujian backup Phase 5

Semua pengujian menggunakan direktori sementara. Pengujian tidak membuat salinan database warga yang sebenarnya dan tidak mengunggah data ke cloud.

| Pemeriksaan | Bukti |
|---|---|
| Konsistensi WAL dan pra-migrasi | Fixture memuat Sagara, Aurora, rumah X 18/Z 12 dan riwayat dunia. Migrasi menghasilkan snapshot pra-v5. Snapshot sesudah pemilu lolos integrity_check dan foreign_key_check. |
| Restore lokal | Database hasil pada path baru cocok dengan sumber untuk seluruh baris dunia, revision, chunk, event, akun, penampilan, domisili, jabatan, proposal, hasil pemilu dan audit yang dibandingkan. |
| Kerahasiaan voting | Surat suara hasil restore hanya memiliki nonce, election dan candidate. Identitas pemilih tersimpan pada participation. Sesi warga dihapus dari arsip; sesi pada sumber tetap ada. |
| Pencegahan overwrite | Target yang sudah ada dan path database aktif ditolak. Kunci salah dan ciphertext yang diubah juga ditolak. |
| Scheduler | Dua tick berdekatan tidak membuat dua backup terjadwal. Worker watch di interval uji yang dipercepat benar-benar membuat dua backup otomatis. Setelah kegagalan snapshot karena kunci salah, backup baik sebelumnya masih dapat dipulihkan. |
| Panel administratif | Dalam Edge, admin berhasil membuat snapshot manual. Panel mengembalikan integritas ok dan status remote belum aktif. Warga terpilih sebagai gubernur mendapat HTTP 403 pada endpoint backup. |
| Staging PostgreSQL | Konversi ke PGlite mempertahankan hasil 2–1 dan jumlah government events. Uji migrasi sebelumnya memeriksa rollback dan RLS default-deny. |
| Kontrak remote | SDK dengan transport stub menolak bucket publik sebelum PUT, mengirim ciphertext, menolak checksum GET berbeda, menerima checksum cocok, lalu melakukan restore ke vault baru. Tidak ada koneksi ke AWS pada tes kontrak. |

Reproduksi dari root proyek dengan `node tests/government-recovery.mjs`, `node tests/recovery-remote.mjs`, `node tests/postgres-migration.mjs`, lalu build produksi dan `node tests/government-browser.mjs`. Tes browser membutuhkan Edge.

**Status operasional:** bucket S3 untuk run ini tidak dikonfigurasi. Tidak ada backup off-site yang terverifikasi. Uji di akun cloud tujuan, simulasikan kehilangan host dan kunci lokal, lalu ukur RPO/RTO sebelum mengandalkan layanan untuk produksi.
