# Phase 5B — langkah deployment yang belum dijalankan

Ditinjau 4 November 2026. Tidak ada resource cloud yang dibuat oleh audit ini. Laporan audit terbaru: `docs/PHASE_5B_RUNTIME_AUDIT.md`.

**Keputusan pemilik terbaru:** dunia awal permanen telah disetujui sebagai sumber Closed Beta. Gunakan kontrak `source-contract.json` dan `--allow-seed-source` saat cutover; tidak perlu mencari data tes lama. Rencana region Singapore, source GitHub, biaya, koneksi akun dan persetujuan ada di [rencana peluncuran](../../docs/CLOSED_BETA_LAUNCH_PLAN.md). Instruksi di bawah dibaca bersama pembaruan ini.

## 1. Hubungkan akun, tanpa provisioning

1. Buka [Railway](https://railway.com/dashboard), masuk melalui akun GitHub yang berhak membaca source NationCityAI. Hubungkan aplikasi Railway di direktori plugin jika ingin pengelolaan melalui chat; hasil pencarian menunjukkan plugin tersedia tetapi belum terpasang. Jangan menempel token ke chat.
2. Tentukan workspace, environment **staging**, region, batas anggaran dan daftar username beta. Persetujuan anggaran diperlukan sebelum membuat project/service/database berbayar, bucket, atau mengaktifkan deployment otomatis.
3. Gunakan branch rilis/PR terbaru dari checkout Git terpisah yang melanjutkan checkpoint Phase 5. Jangan deploy `main` Phase 4 sebelum PR rilis digabungkan. Source runtime lokal tidak otomatis sama dengan GitHub. Jangan sertakan `.env.local`, `data/`, backup, file SQLite, kunci, atau ekspor SQL privat. Jangan mengaktifkan autodeploy sebelum konfigurasi dan migrasi siap.
4. Masuk AWS Console menggunakan identitas pengelola yang sesuai; pilih region S3 dan tentukan anggaran. Kredensial AWS hanya melalui AWS credential provider atau secret store operator/worker.

## 2. Konfigurasi Railway saat ini

[Dokumentasi Railway IaC](https://docs.railway.com/infrastructure-as-code) menyatakan Config as Code TOML deprecated, tidak dapat dipilih layanan baru, dan cutoff legacy 1 Desember 2026. Tiga TOML di folder ini dipertahankan sebagai referensi legacy. Untuk project baru gunakan pengaturan dashboard di bawah; alternatifnya impor konfigurasi aktual dengan `railway config pull`, tinjau `railway config plan`, lalu mintakan persetujuan sebelum `railway config apply`. Jangan gunakan opsi yang menampilkan nilai secret.

| Pengaturan | web | multiplayer | backup |
|---|---|---|---|
| Source root | root repository | root repository | root repository |
| Builder | Dockerfile | Dockerfile | Dockerfile |
| Dockerfile | `deploy/railway/Dockerfile` | sama | sama |
| Variabel build path bila diperlukan | `RAILWAY_DOCKERFILE_PATH=deploy/railway/Dockerfile` | sama | sama |
| Start command | `node scripts/staging-service.mjs web` | `node scripts/staging-service.mjs multiplayer` | `node scripts/staging-service.mjs backup` |
| Health check | `/api/health` | `/health` | tidak ada HTTP listener |
| Timeout health | 90 detik | 90 detik | — |
| Replika awal | 1 | **1** | 1 |
| Restart | ON_FAILURE, maksimum 10 | sama | sama |
| Serverless sleeping | matikan | **matikan** | **matikan** |
| Domain publik | HTTPS web | HTTPS matchmaking + WSS | **tidak ada** |

Next.js memakai `0.0.0.0:$PORT`; Colyseus memakai `[::]:$PORT`. Gunakan port yang sama pada target domain dan health check. Satu domain Colyseus melayani HTTP matchmaking dan upgrade WSS. Worker tidak perlu port atau domain. PostgreSQL persisten harus berada di environment/region yang sama. Jangan menggunakan akun owner PostgreSQL pada aplikasi. [Health check Railway](https://docs.railway.com/deployments/healthchecks), [jaringan privat](https://docs.railway.com/networking/private-networking).

Dockerfile mengecualikan secret/data melalui `.dockerignore`, menjalankan `npm ci`, build Next.js, prune dependency dev, lalu menjalankan aplikasi sebagai user `node`. Engine Docker lokal belum tersedia untuk memverifikasi image; build image Linux pada Railway tetap merupakan gate sebelum beta.

## 3. Pisahkan variabel dan akses

Gunakan `staging.env.example` sebagai **daftar nama**, bukan file berisi secret yang di-commit. Jangan menyalin semua variabel ke semua service.

| Penerima | Variabel |
|---|---|
| web + multiplayer | `NATION_ENV=staging`, `NATION_DB=postgres`, `DATABASE_URL` role runtime melalui jaringan privat, `WEB_ORIGIN=https://<domain-web>` tanpa slash akhir, `CLOSED_BETA=true`, `BETA_USERNAMES` dipisahkan koma, `BETA_INVITE_KEY` acak minimal 32 karakter |
| web saja | `ADMIN_KEY` acak minimal 32 karakter yang berbeda dari kunci beta, `MULTIPLAYER_PUBLIC_URL=wss://<domain-multiplayer>` |
| backup saja | `NATION_ENV=staging`, `NATION_DB=postgres`, `DATABASE_URL` runtime, `BACKUP_S3_BUCKET`, `AWS_REGION`, `BACKUP_KEY` 32 byte Base64, IAM credential provider, `BACKUP_INTERVAL_HOURS=12` |
| Operator migrasi saja | `MIGRATION_SOURCE`, `MIGRATION_DATABASE_URL` owner, `MIGRATION_TARGET_DATABASE`, `RUNTIME_DB_ROLE=nation_app`, `MIGRATION_WRITES_FROZEN=true`, `BACKUP_DIR` privat, `BACKUP_KEY`, `AWS_REGION`, `BACKUP_S3_BUCKET`, IAM credential provider |
| Operator restore drill saja | `DATABASE_URL` staging, `RESTORE_DATABASE_URL` owner database drill **bernama berbeda**, `RESTORE_TARGET_DATABASE`, `RUNTIME_DB_ROLE`, variabel AWS dan kunci backup |

Jangan menyebarkan AWS credentials, `BACKUP_KEY`, atau URL owner ke web/multiplayer. Simpan salinan pemulihan kunci backup di secret manager terpisah. Untuk koneksi PostgreSQL eksternal, driver memverifikasi TLS; gunakan `PG_CA_PEM` jika CA provider dibutuhkan. Jangan menonaktifkan pemeriksaan sertifikat. Host `.railway.internal` hanya terjangkau dari jaringan privat Railway; migrasi dari Windows memerlukan jalur koneksi yang didukung provider dan TLS yang terverifikasi, atau job operator privat di Railway.

## 4. Tentukan sumber dan lakukan cutover setelah disetujui

Database `D:\Web Project\Nation City\data\nation.sqlite` adalah dunia awal permanen dan **telah dipilih pemilik untuk beta**. Fingerprint pada `source-contract.json` mengunci revisi, jumlah objek serta seluruh ID/koordinat; migrasi menolak perubahan sumber. Keputusan sumber sudah final untuk cutover ini, sedangkan provisioning masih menunggu persetujuan biaya.

Audit read-only dan rehearsal lokal dapat diulang:

```powershell
node scripts/audit-sqlite.mjs "D:\Web Project\Nation City\data\nation.sqlite"
node scripts/migration-rehearsal.mjs "D:\Web Project\Nation City\data\nation.sqlite"
```

Setelah anggaran disetujui, sediakan PostgreSQL staging serta database drill dengan nama berbeda. Buat role LOGIN runtime biasa, tanpa SUPERUSER, BYPASSRLS, CREATEDB, CREATEROLE, REPLICATION, dan tanpa membership role owner. Lakukan migrasi dengan owner; aplikasi memakai role runtime. Siapkan bucket dan verifikasi S3 seperti bagian 5 terlebih dahulu.

Hentikan **semua** penulis database sumber: web, multiplayer, worker/CLI mutasi lain. Pastikan sumber absolut yang dipilih benar. Set `MIGRATION_WRITES_FROZEN=true` hanya setelah penulis berhenti. Dari terminal operator privat dengan variabel terpasang:

```powershell
node scripts/staging-migrate.mjs --confirm-new-schema --allow-seed-source
```

Hanya bila pemilik sudah memilih database dunia awal sebagai sumber beta, tambahkan `--allow-seed-source`. Guard akan menolak sumber seed tanpa pilihan eksplisit ini. Migrasi memeriksa kelengkapan tabel/versi/integritas, membuat backup WAL terenkripsi, mewajibkan baca-balik S3 terverifikasi, memulihkan salinan beku, lalu mengimpor ke schema `nation_import` baru dalam transaksi. Jumlah dan signature setiap tabel diperiksa. Target yang sudah memiliki schema tersebut ditolak, bukan ditimpa. SQLite asli tidak dihapus; pertahankan sebagai sumber read-only setelah cutover. Sesi/tiket tidak ikut; bukti moderasi mengikuti retensi yang didokumentasikan.

## 5. S3 privat dan bukti pemulihan

Setelah persetujuan biaya, gunakan bucket AWS S3 khusus dengan keempat Block Public Access aktif, BucketOwnerEnforced, versioning belum pernah diaktifkan, dan lifecycle expiration satu hari untuk `nation-backups/`. Template `s3-lifecycle.json` dan `s3-worker-policy.json` tersedia; ganti placeholder nama bucket sebelum memasang kebijakan. IAM ini tidak memberi izin membuat bucket atau mengubah kebijakannya. Gunakan enkripsi default SSE-S3; penggunaan SSE-KMS memerlukan rancangan izin KMS tambahan.

Simpan credential dan `BACKUP_KEY` pada terminal privat operator; jangan tulis nilai ke perintah shell yang direkam atau chat. Tentukan `BACKUP_DIR` privat di luar source. Untuk menguji bucket yang sudah ada, setelah upload diizinkan:

```powershell
node scripts/verify-s3-backup.mjs "D:\Web Project\Nation City\data\nation.sqlite" --confirm-upload --report "docs/s3-live-verification.json"
```

Perintah ini memeriksa privasi bucket, mengirim ciphertext dengan checksum, membaca kembali objek, lalu melakukan restore **dari vault lokal baru** menggunakan GET S3. Signature semua tabel dibandingkan dengan snapshot yang dibekukan. Tidak ada bucket atau layanan yang dibuat otomatis. Laporan baru dianggap bukti cloud setelah perintah ini benar-benar sukses; tes stub tidak cukup. Retensi lokal dapat berbeda dari salinan off-site operasional satu hari. Lifecycle S3 bersifat asinkron; pantau pelaksanaannya. [Lifecycle expiration AWS](https://docs.aws.amazon.com/AmazonS3/latest/userguide/lifecycle-expire-general-considerations.html).

Sesudah runtime PostgreSQL staging aktif, jalankan `node scripts/staging-backup.mjs tick`; pilih ID job verified pada panel admin, lalu lakukan drill:

```powershell
node scripts/staging-backup.mjs restore-drill <ID> --confirm-new-schema
```

Pastikan database drill bernama berbeda dan belum memiliki `nation_import`. Status `restored_at` hanya ditulis setelah import drill sukses. Ulangi login, cek dunia, karakter, hasil pemilu dan riwayat pada environment drill. Monitoring eksternal untuk backup gagal/terlambat masih perlu dikonfigurasi pada akun hosting.

## 6. Buka closed beta dan uji internet

Setelah migrasi dan konfigurasi selesai, aktifkan domain platform untuk web dan multiplayer atas persetujuan publikasi. Sesuaikan `WEB_ORIGIN` serta URL WSS, lalu deploy revisi yang sama. Jangan membuka domain worker/database sebagai website publik. Konektivitas publik PostgreSQL sementara untuk operator harus dibatasi dan dinonaktifkan kembali setelah migrasi.

Untuk setiap username samaran di allowlist jalankan `node scripts/issue-beta-invite.mjs USERNAME` di terminal operator privat. Perintah ini **mengeluarkan kode undangan**, sehingga jangan jalankan dalam log CI/chat yang terlihat publik. Serahkan kode secara privat. Pencabutan username dari allowlist harus diikuti pembaruan konfigurasi web dan multiplayer.

Gunakan dua perangkat dan dua jaringan internet untuk menguji: sertifikat HTTPS valid, `/api/health` dan `/health` HTTP 200, cookie Secure+HttpOnly, upgrade WSS dari origin beta, penolakan origin lain dan pengguna di luar allowlist, karakter, gerakan, chat dekat/jauh, perjalanan, reconnect, pemilu, serta admin. Catat URL, revisi source/image, waktu, perangkat dan jaringan. **HTTPS/WSS loopback dan emulasi ponsel bukan bukti ini.**

Rollback aplikasi menggunakan image PostgreSQL sebelumnya yang kompatibel. Untuk rollback data, hentikan penulis, buat snapshot pengaman, restore ke database baru dan alihkan semua layanan bersama-sama. Jangan langsung menyalakan SQLite yang telah tertinggal setelah warga menulis ke PostgreSQL.
