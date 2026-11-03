# Phase 5 — Pemerintahan dan pemilu virtual

## Pemerintahan

Portal /pemerintahan menggunakan identitas warga dan geografi yang sudah ada. Hierarki negara, provinsi, kabupaten/kota, kecamatan, desa/kelurahan, RW dan RT berasal dari atlas. Jabatan dikonfigurasi per wilayah, dengan judul bebas atau preset dari presiden hingga ketua RT, durasi, usia minimum akun kandidat, mekanisme pemilihan atau penunjukan admin, tautan ke gedung balai, dan izin pengumuman dalam game. Jabatan tidak memberikan hak administrasi platform.

Warga memakai UUID dan karakter lama. Riwayat domisili terpisah dari koordinat perjalanan. Warga mulai pada domisili nasional dan dapat mendaftarkan wilayah, lalu menunggu tujuh hari sebelum pindah lagi. Perpindahan dari atau menuju wilayah yang terkena pencalonan, review atau voting dibatasi. Profil menampilkan domisili dan titel aktif. Informasi surat suara individu tidak disediakan kepada admin maupun publik melalui portal.

## Pemilihan

Admin membuat jadwal dan aturan seri, membuka pencalonan, meninjau program, menyetujui kandidat dan membuka voting. Jadwal dapat diubah sebelum voting. Perintah menjalani validasi server, termasuk kepemilikan sesi, kewenangan admin terpisah, schema payload, state, usia akun, domisili, karakter dan pembatasan akun. Satu warga tidak dapat mengikuti pencalonan aktif yang bertentangan. Waktu tersimpan dalam milidetik UTC. Tampilan default Asia/Jakarta dapat diubah melalui NEXT_PUBLIC_GOV_TIMEZONE saat build. Input datetime-local menggunakan zona perangkat admin.

Alur state: DRAFT → NOMINATION → REVIEW → VOTING → CLOSED → FINALIZED, atau CANCELLED sebelum finalisasi. Snapshot eligibility pada pembukaan menerima warga berdomisili di wilayah pemilihan atau turunannya yang memenuhi syarat. VOTER_MIN_AGE_HOURS mengatur usia akun minimum pemilih (default 0). Batas laju per identitas, pembatasan registrasi sebelumnya dan pembekuan daftar mengurangi sebagian penyalahgunaan; satu akun tetap tidak setara dengan verifikasi satu manusia.

BEGIN IMMEDIATE, primary key (election,citizen), FK komposit dan insert surat suara dalam satu transaksi mencegah suara ganda. Private ballot memiliki nonce acak tanpa ID atau timestamp pemilih. Tabel partisipasi dan ballot SQLite dibuat WITHOUT ROWID. Langkah ini memisahkan pilihan dari identitas di aplikasi. Operator database, pengamat trafik atau analisis timing tidak tercakup dalam jaminan anonimitas kriptografis.

Setelah tenggat server menolak suara walau UI belum disegarkan. Admin dapat menutup lebih awal; tindakan dicatat. Finalisasi menghitung dari ballot, menyimpan hasil, mengganti masa jabatan sebelumnya dan mencatat pelantikan dalam satu transaksi. Pengulangan finalisasi sukses tanpa penghitungan atau pelantikan kedua. Seri menghasilkan tidak ada pelantikan atau pendaftar paling awal, sesuai aturan yang sudah tercatat. Nol suara tidak menghasilkan pelantikan. Masa jabatan berakhir berdasarkan waktu server; histori dan karakter warga tetap tersimpan.

## Karakter, kantor dan pembangunan

Pakaian dinas adalah overlay opsional pada karakter asli. Multiplayer menampilkan titel, gestur upacara/pidato/pengumuman dan representasi seremonial Chibi di balai tertaut yang berada di sekitar pemain. Pejabat yang dekat dengan kantornya memperoleh tautan layanan kantor; server memeriksa jabatan aktif untuk setiap tindakan khusus. Gedung memakai aset balai yang sudah ada. Hak pengumuman dibatasi pada wilayah jabatan.

Usulan warga menggunakan jenis infrastruktur, wilayah domisili yang memenuhi syarat dan deskripsi. Admin meninjau dan menyetujui atau menolak usulan. View construction_queue memilih usulan APPROVED. Pengiriman maupun persetujuan tidak mengubah objek dunia. Government events menyimpan ID, waktu, wilayah, aktor dan metadata untuk pelantikan, tahapan pemilihan, perubahan jabatan, usulan dan pengumuman. Wilayah baru dicatat ketika proyeksi pemerintahan membaca atlas. Riwayat edit atlas lengkap tetap tersimpan pada world_events.

## Struktur, database dan deployment

- packages/government/schema.mjs dan service.mjs memuat migrasi v5, aturan, transaksi dan query. Tabel mencakup gov_regions, residency, offices, elections, candidates, eligibility, participation, ballots, election_results, office_terms, proposals, gov_events dan gov_audit. Relasi official_assignments memproyeksikan masa jabatan. Query runtime memeriksa waktu berlakunya.
- apps/web/app/pemerintahan dan api/government memuat ringkasan, pemerintahan wilayah, pencalonan, pusat pemilihan, profil pejabat, usulan dan administrasi. Semua bagian dapat diakses dari menu portal.
- Citizen, Explore, Game, Chibi, model dan database warga serta server Colyseus mengintegrasikan profil, seragam, gelar dan kantor.
- packages/recovery, scripts/recovery.mjs, /pemulihan dan /api/recovery memisahkan source dari cadangan privat. Panduan dan hasil pengujian ada di BACKUP_AND_RECOVERY.md dan BACKUP_TEST_REPORT.md.
- Runtime tetap SQLite WAL dengan satu host layanan. Eksportir staging menyertakan tabel pemerintahan dan indeks unik PostgreSQL. Pengujian memakai PGlite; runtime adapter transaksi PostgreSQL multi-node, isolation/retry dan cutover hosted perlu pekerjaan lanjutan. Pertahankan kontrak perintah server, pindahkan compare-and-change dan finalisasi ke transaksi dengan row lock PostgreSQL, ulangi suite konkuren menggunakan beberapa proses, verifikasi hak akses dan backup di staging sebelum cutover.

## Verifikasi

Di Edge terdapat empat warga pada konteks terpisah dan satu administrator. Aruna serta Bima mencalonkan diri sebagai gubernur Aurora, admin menyetujui keduanya, dan warga mengonfirmasi pilihan di UI. Dua permintaan paralel Citra menghasilkan HTTP 200 dan 400. Dara yang berdomisili di luar wilayah ditolak. Hasil tersimpan 2–1. Pengesahan berulang menghasilkan satu pelantikan. Aruna terlihat sebagai gubernur di profil dan game, mengenakan seragam serta menjalankan gestur pidato, sementara penampilan asli tetap identik. Akses Aruna ke mutasi dunia, moderasi dan backup ditolak.

Pengujian domain dan integrasi tambahan meliputi pembekuan domisili, pemalsuan payload, akun tanpa hak pilih, rollback partisipasi bila insert ballot gagal, batas akhir server, masa jabatan kedaluwarsa, persetujuan proposal, restore dan konversi staging. Build produksi dan typecheck berhasil. Semua pengujian pemilu dan pemulihan memakai dataset sintetis terisolasi.

## Batas penerapan

Verifikasi ini untuk penggunaan lokal. Belum ada benchmark pemungutan berskala besar, verifikasi identitas dunia nyata, audit keamanan independen atau restore cloud nyata. Admin menggunakan identitas peran bersama. Pembaruan portal dapat memerlukan muat ulang setelah perubahan dari sesi lain. Basis Phase 6 adalah antrean usulan disetujui dan ID wilayah/gedung persisten; implementasi konstruksi AI belum dimulai.

Regresi akhir pada build yang sama: 28/28 tes unit lulus. Tes Edge Phase 1?2 lulus untuk rumah (18,12), atlas dan persistensi. Dua akun Phase 3 lulus untuk karakter, collision, perjalanan dan reconnect. Tiga akun Phase 4 lulus untuk chat spasial, isolasi frame, laporan, blokir dan sanksi.
