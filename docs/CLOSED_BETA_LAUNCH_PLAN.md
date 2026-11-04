# Closed Beta — rencana yang menunggu persetujuan biaya

Tanggal rencana: 4 November 2026. Pemilik sudah memilih database permanen dunia awal untuk beta. Tidak perlu mencari/reka ulang karakter atau pemilu tes lama. Phase 6 tidak termasuk scope.

## Source dan data

Repository: `https://github.com/dikadwi1005-ai/NationCityAI`. Pemeriksaan remote menemukan `main` pada `f0594bf385f7ef01a1054c8f7c1eae29552dc178` masih Phase 4. Checkpoint Phase 5 `82a1b88c6a6775611df719def328fbc34176cb30` merupakan kelanjutan main, bukan riwayat terpisah. Branch rilis `release/phase-5b-closed-beta-20261104` menggunakan checkpoint tersebut sebagai induk lalu menambahkan source Phase 5B terbaru. Jangan deploy main lama; pilih commit PR rilis yang diuji, atau main sesudah PR tersebut benar-benar digabungkan.

Checkout rilis dibuat terpisah dari runtime lokal. Pemindahan source menggunakan allowlist, tanpa menghapus file remote-only. SQLite, `.env.local`, backup, file kunci dan laporan mesin operator tidak dipublikasikan. Git for Windows 2.52.0 sudah tersedia; instalasi ulang tidak diperlukan.

`deploy/railway/source-contract.json` menyimpan fingerprint dunia yang disetujui: revisi 0, 32 objek, seluruh ID dan koordinat. Migrasi memeriksa kontrak sebelum backup dan sekali lagi pada salinan beku. Pilihan sumber sudah disetujui; operator menggunakan `--allow-seed-source`, tanpa perlu meminta keputusan sumber lagi. Backup konsisten terbaru telah dibuat dan dipulihkan lokal; detail privat berada pada laporan operator yang dikecualikan dari Git.

## Arsitektur dan region

Railway environment **staging**, dengan empat layanan selalu aktif: Next.js web, satu Colyseus, PostgreSQL dengan volume persisten, dan worker backup. Seluruhnya ditempatkan pada **Southeast Asia Metal / Singapore (`asia-southeast1-eqsg3a`)** jika tersedia pada workspace saat provisioning. Bucket S3 privat berada pada AWS **Singapore (`ap-southeast-1`)**. Verifikasi pemilihan region sebelum membuat volume agar tidak perlu migrasi volume sesudahnya. [Region Railway](https://docs.railway.com/deployments/regions), [endpoint AWS S3](https://docs.aws.amazon.com/general/latest/gr/s3.html).

Web memakai HTTPS, Colyseus memakai HTTP matchmaking melalui HTTPS dan WebSocket melalui WSS pada domain terpisah. Worker tidak memiliki domain publik. Database diakses layanan melalui jaringan privat. Jangan aktifkan sleeping atau replika ganda pada Colyseus. Database drill boleh memakai nama database kedua pada instance yang sama untuk menghemat compute, tetapi itu bukan simulasi kegagalan seluruh host. Drill recovery hosted terpisah memerlukan persetujuan biaya tambahan bila memakai instance lain.

## Estimasi biaya bulanan (USD, sebelum pajak)

Ini perhitungan perencanaan 30 hari, bukan hasil pengukuran staging. [Harga Railway saat ditinjau](https://docs.railway.com/pricing): RAM $10/GB/bulan, CPU $20/vCPU/bulan, volume $0.15/GB/bulan, egress $0.05/GB. Subscription Hobby minimum $5 sudah diperhitungkan sebagai credit usage; jangan menambahkan $5 lagi di atas total usage yang lebih besar. Tidak ada biaya tambahan AI Builder/Phase 6 atau Railway Agent yang direncanakan.

| Komponen | Asumsi rata-rata | Estimasi |
|---|---|---:|
| Next.js | 0.50 GB RAM + 0.05 vCPU | $6.00 |
| Colyseus | 0.35 GB RAM + 0.10 vCPU | $5.50 |
| PostgreSQL | 0.50 GB RAM + 0.05 vCPU | $6.00 |
| Worker backup | 0.20 GB RAM + 0.01 vCPU | $2.20 |
| Volume PostgreSQL | 5 GB | $0.75 |
| Egress Railway | 20 GB termasuk traffic beta/backup | $1.00 |
| Subtotal ilustratif Railway | 1.55 GB + 0.21 vCPU rata-rata | **$21.45** |
| S3 Standard privat | rata-rata ≤1 GB, sekitar 60 backup/bulan, beberapa read-back/drill, tanpa add-on KMS/replication/CloudTrail data events | **cadangan anggaran $0.10–$1.00** |
| Total ilustratif | sebelum pajak, tanpa domain berbayar | **sekitar $22–$23** |

Untuk variasi runtime dan acceptance test, rencanakan **$25–$40/bulan**. Biaya dapat meningkat bila RAM/CPU/egress melebihi asumsi, ukuran backup membesar, instance drill tambahan dibuat, atau layanan lain sudah memakai workspace. Allowance S3 bukan kutipan tarif flat; storage, request dan transfer ditagih sesuai region/pemakaian. Konfirmasikan kalkulator AWS untuk bucket/akun saat provisioning. [Harga S3](https://aws.amazon.com/s3/pricing/).

Usulan pengendalian yang perlu disetujui pemilik: Railway Compute alert **$25**, hard limit **$40** pada workspace beta yang terpisah; AWS monthly budget alert **$2**. AWS budget adalah alarm, bukan hard cap. Hard limit Railway mematikan workload jika terlampaui, sehingga beta akan offline dan job backup dapat terhenti. Pastikan batas ini tidak mematikan project lain pada workspace. [Cost Control Railway](https://docs.railway.com/pricing/cost-control), [batas notifikasi AWS Budgets](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html).

Usulan limit awal per replika: web 1 GB/1 vCPU, Colyseus 1 GB/1 vCPU, PostgreSQL 1 GB/1 vCPU, worker 0.5 GB/0.5 vCPU, semuanya 1 replika; volume 5 GB. Ini batas resource, bukan jaminan biaya atau kapasitas pemain. Terlalu rendah dapat menyebabkan OOM; pengukuran setelah deploy menentukan penyesuaian. Mulai dengan allowlist kecil 5–10 akun, lalu ukur; ini batas akses awal, bukan janji jumlah pemain bersamaan.

## Akun dan langkah pemilik

1. **GitHub:** akses repository sudah terverifikasi menggunakan akun pemilik. Tinjau PR source terbaru. Merge hanya setelah review; alternatifnya deploy commit branch PR secara eksplisit. Jangan menyalakan autodeploy main Phase 4.
2. **Railway:** masuk ke dashboard, pilih workspace untuk beta, hubungkan integrasi GitHub hanya ke NationCityAI. Jika ingin pengelolaan lewat chat, hubungkan plugin Railway melalui direktori aplikasi; jangan menempel token ke chat. Koneksi plugin/account saja tidak memberikan persetujuan biaya.
3. **Persetujuan:** setujui/ubah anggaran, hard limit, region, environment dan pembuatan keempat layanan serta bucket. Sebelum persetujuan ini tidak ada provisioning atau deployment berbayar.
4. **Sesudah disetujui:** buat project NationCityAI dengan environment staging; set usage controls; provision PostgreSQL persisten di Singapore; buat database `nation_staging`, database `nation_restore_drill` dan role runtime `nation_app` biasa. Owner dipakai operator migrasi saja. Jangan pasang URL owner pada web/Colyseus/worker.
5. Tambahkan web, multiplayer dan backup dari source rilis yang sama dengan root repository serta Dockerfile `deploy/railway/Dockerfile`. Atur command/health/variabel menurut `deploy/railway/README.md`. Jika belum dimigrasi, biarkan aplikasi gagal tertutup; jangan ganti ke SQLite untuk membuat health check hijau.
6. **AWS:** masuk AWS Console dengan identitas admin yang sesuai, bukan membagikan akun root. Setelah disetujui, buat bucket khusus Singapore dengan Block Public Access, BucketOwnerEnforced, SSE-S3, lifecycle satu hari dan versioning belum pernah diaktifkan. Template IAM/lifecycle ada di folder deployment.
7. **Secret:** operator lokal sebaiknya memakai AWS CLI v2 + IAM Identity Center/SSO pada profil privat (`aws configure sso`, `aws sso login`). SDK membaca profil tersebut. Untuk worker Railway di luar AWS, gunakan identitas IAM khusus dengan policy bucket/prefix minimum; masukkan credential langsung ke Railway Variables **worker saja**, atau gunakan STS dengan mekanisme refresh yang nyata. Credential STS yang kedaluwarsa tanpa refresh akan menghentikan backup. Jangan menulis credential ke source/chat/log. Simpan `BACKUP_KEY` terpisah pada secret manager dengan salinan recovery.
8. Tentukan username samaran beta dan masukkan allowlist yang sama pada web/multiplayer. Secret admin, undangan beta dan backup harus berbeda. Generate/inject melalui terminal privat/password manager; jangan cetak ke chat.

## Urutan cutover dan gate internet

1. Setelah bucket tersedia dan upload disetujui, jalankan verifikasi S3 `verify-s3-backup.mjs` dengan konfigurasi operator. Wajib encrypted PUT, GET checksum, restore dari vault baru dan perbandingan semua tabel; tes stub tidak memenuhi gate ini.
2. Hentikan seluruh penulis SQLite sumber, audit fingerprint, lalu set `MIGRATION_WRITES_FROZEN=true`. Jalankan `node scripts/staging-migrate.mjs --confirm-new-schema --allow-seed-source` dari checkout rilis dengan sumber absolut permanen dan secret operator. Backup konsisten baru tetap dibuat saat cutover; SQLite asli tidak dihapus.
3. Konektivitas operator ke PostgreSQL memakai jalur privat/tunnel resmi atau TLS provider dengan CA tervalidasi. Jangan mematikan verifikasi sertifikat jika endpoint publik menolak verifikasi; gunakan job operator privat/tunnel yang tepat. Jangan menyalin source SQLite ke repo untuk memindahkannya ke Railway.
4. Import schema `nation_import` baru; cocokkan jumlah/signature seluruh tabel dan fingerprint 32 objek. `NATION_ENV=staging` dan `NATION_DB=postgres` wajib. Health check web dan Colyseus harus melaporkan `backend=postgres`, `schemaVersion=51`, serta SHA source rilis yang sama. Database yang tidak siap menghasilkan kegagalan, bukan fallback SQLite.
5. Setelah publikasi disetujui, buat domain platform web/multiplayer; atur `WEB_ORIGIN=https://...` dan `MULTIPLAYER_PUBLIC_URL=wss://...`, lalu redeploy. Domain provider menghindari pembelian domain khusus. Hanya web/multiplayer yang publik.
6. Jalankan acceptance publik sesuai `docs/CLOSED_BETA_ACCEPTANCE.md`. Ukur resource/latensi, cek restart dan backup, lalu catat hasil aktual. Jangan menyatakan target online tercapai sebelum URL publik dan pengujian lintas perangkat/jaringan benar-benar tersedia.

## Batasan dan risiko

Satu replika Colyseus dan satu PostgreSQL belum HA. Runtime driver domain melakukan round-trip sinkron yang memblokir eksekutor selama query; batasi beta dan ukur event-loop lag sebelum menaikkan akses. Admin memakai shared key, bukan identitas moderator individual. Restore logis tidak memulihkan role database, secret, DNS atau konfigurasi provider. Retensi off-site operasional satu hari tidak menggantikan rancangan arsip jangka panjang. Hard cap menyebabkan downtime saat batas tercapai. Login ulang diperlukan setelah migrasi/restore karena sesi/tiket sengaja tidak disalin. Dua profil browser pada satu mesin tidak membuktikan dua perangkat/jaringan fisik.

Status saat rencana disiapkan: source/checkpoint telah direkonsiliasi lokal; sumber dunia awal sudah disetujui dan backup lokal diverifikasi. Workspace Railway, bucket/credential AWS, persetujuan anggaran, migrasi cloud, URL publik dan hasil acceptance internet masih menunggu koneksi/persetujuan. Phase 6 tidak dimulai.
