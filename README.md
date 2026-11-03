# AI Nation Builder — Phase 1

Phase 1 terverifikasi pada Windows, Node 26.13.0 dan Microsoft Edge. Klik pada viewport menempatkan rumah pada X 18, Z 12. Server mengakui penyimpanan. Setelah refresh, pengujian mencocokkan rekaman lengkap dan memilih mesh rumah dengan ID yang sama.

## Menjalankan

Diperlukan Node.js 24+, npm, akses npm registry, dan browser WebGL 2.

```bash
cd <folder-proyek>
npm ci
# Ganti dengan kunci acak pribadi minimal 24 karakter.
export ADMIN_KEY='ganti-dengan-kunci-acak-pribadi-minimal-24-karakter'
export WORLD_DATA_DIR="$PWD/data"
npm run dev
```

Buka http://localhost:3000. Pilih **Masuk admin**, masukkan kunci yang sama. Pilih objek pada katalog lalu klik daratan. Perubahan dikirim ke server dan disimpan langsung; tunggu status “Tersimpan di server”. Refresh untuk memeriksa posisi yang sama. Pengunjung hanya membaca dunia. Jangan gunakan contoh kunci untuk server yang dapat diakses orang lain.

Next.js membaca `.env.local` dari `apps/web/`; file contoh root tidak otomatis dimuat. Alternatif variabel shell: salin `.env.example` ke `apps/web/.env.local`, lalu isi kunci pribadi.

```bash
npm test              # tanpa npm install, memakai test runner dan SQLite Node 24
npm run typecheck     # memerlukan dependency
npm run build         # memerlukan dependency
npm start             # setelah build berhasil
```

Kontrol: drag kiri untuk pan; scroll/cubit untuk zoom; drag kanan untuk orbit; R memutar preview; Escape membatalkan. Klik bangunan untuk memilih, memindahkan, memutar atau menghapus. Undo/redo menyimpan perubahan baru ke server; riwayat tombol berlaku selama sesi browser. Mode grafis ringan menonaktifkan shadow dan mengurangi resolusi render.

## Struktur

- `PROJECT_MASTER.md`: salinan lengkap dan identik dari TXT pengguna; sumber utama.
- `apps/web/app`: Next.js App Router, CSS, API dunia dan sesi admin.
- `apps/web/components`: editor, tampilan Three.js, state Zustand.
- `packages/nation-core/world.ts`: kontrak, schema validator runtime, terrain, collision, reducer, inverse commands.
- `packages/world-engine/Models.tsx`: model low-poly asli berbasis geometri, dapat dipakai renderer nanti.
- `packages/persistence/store.ts`: SQLite WAL, transaksi, deduplikasi request, revision guard dan snapshot event.
- `tests/world.test.ts`: 18 tes domain dan database disk.
- `docs/ARCHITECTURE.md`: integrasi seluruh sistem dan keputusan teknis.
- `docs/DATABASE.md`: schema aktual dan rancangan database lanjutan.
- `docs/ROADMAP.md`: urutan fase serta gerbang penerimaan.
- `docs/PHASE_1_REPORT.md`: hasil nyata dan pekerjaan yang belum terverifikasi.

## Penyimpanan & operasi

Database berada pada `$WORLD_DATA_DIR/nation.sqlite`, default `data/` relatif working directory proses. Gunakan path absolut untuk menghindari database berbeda antara dev dan start. Jangan hapus direktori tersebut. Backup konsisten: hentikan server sebelum menyalin seluruh direktori data, atau gunakan SQLite online backup. Uji restore sebelum mengandalkan backup. Jangan menjalankan SQLite ini sebagai backend serverless/stateless. Adapter ini untuk satu node pengembangan; migrasikan ke PostgreSQL sebelum scale-out.

Sesi administrator memakai cookie HttpOnly, SameSite Strict, HMAC, kedaluwarsa 8 jam, serta Secure di HTTPS. API mutasi memeriksa origin, sesi, payload, grid, collision, lereng dan revisi. Rotasi ADMIN_KEY membatalkan sesi. Mode ini bukan pengganti akun warga atau Supabase Auth pada Phase 3. Login rate limit saat ini global per proses; reverse proxy dan limiter terdistribusi diperlukan sebelum publikasi.

Pada Windows, jalankan `.\scripts\start-windows.ps1` dari folder proyek. Skrip menyiapkan kunci admin lokal dan menjalankan aplikasi. Untuk mengulang verifikasi browser setelah build, jalankan `node tests/placement.mjs` dengan Microsoft Edge terpasang. Tes membuat database sementara sendiri.

## Menjalankan atlas Phase 2

Masuk sebagai admin, klik **Buka atlas negara**, pilih **Buat pulau** dan masukkan nama. Pusat awal X 72, Z 0 menyediakan lokasi di laut pada dunia baru. Klik **Pratinjau terrain** untuk melihat hasil di viewport, lalu **Simpan dunia** untuk commit. Pilih pulau pada daftar untuk memindahkan kamera. Brush dapat dipusatkan dengan klik pada peta atau input koordinat. Gunakan **Ikhtisar nasional** untuk membingkai seluruh negara. Pengunjung dapat membuka atlas tanpa hak simpan.
