# Architecture assessment

Master: ../PROJECT_MASTER.md. Repo awal kosong. Phase 1 mengutamakan command pipeline yang sama untuk editor manual dan rencana AI di masa depan. UI tidak boleh menjadi sumber kebenaran dunia.

## Implementasi saat ini

Browser React/R3F → POST command → pemeriksaan cookie & origin → validator runtime → pure domain reducer → transaksi SQLite (world + event snapshot + request ID) → state otoritatif → browser.

- Next.js App Router menjalankan frontend dan API HTTP pada Node 24.
- Geometri terrain dihitung pada koordinat global. Chunk 16 × 16 unit berbagi sampel batas yang sama; ID koordinat stabil termasuk koordinat negatif.
- Pulau awal menggunakan 24 chunk dan generator versi `island-v1`. Seluruh chunk awal dimuat; streaming radius, LOD nasional dan modifikasi heightmap masuk Phase 2. Jangan mengubah generator v1 setelah dunia dibuat; versi baru membutuhkan migrasi terrain eksplisit.
- Bangunan mempunyai UUID, asset version, region dan owner; ukuran footprint mengikuti rotasi 90°. Penempatan memakai grid 2 meter, memeriksa seluruh footprint terhadap air, kemiringan dan objek lain.
- Semua perubahan berupa place/remove/transform, divalidasi ulang oleh server. UI menunggu ACK penyimpanan, tidak mengklaim autosave sukses sebelum transaksi commit.
- Revision optimistic concurrency menolak penimpaan state dari tab yang tertinggal. Request ID mendukung retry idempotent pada server. UI saat gagal menampilkan error; jika ACK hilang, muat ulang sebelum mengulangi agar terlihat apakah commit sudah terjadi.
- Undo/redo merupakan inverse command baru. Snapshot event lama tidak diubah. Event snapshot menyimpan world/asset/terrain version sebagai fondasi replay dan video; belum ada video renderer.

## Keputusan dan penyimpangan stack

1. **SQLite Node native sementara**, bukan PostgreSQL/Supabase runtime: tidak ada kredensial database dan instalasi npm tertahan sandbox jaringan. Tujuannya menyediakan database transaksional disk yang dapat diuji tanpa layanan eksternal. Implementasi ini bukan PostgreSQL; migrasi belum dijalankan. Boundary repository memungkinkan adapter SQL PostgreSQL berikutnya. Hindari mengembangkan multiplayer di atas snapshot SQLite ini.
2. **CSS biasa**, bukan Tailwind: styling tidak bergantung generator tambahan; tidak mengubah kontrak gameplay. Dapat memakai Tailwind saat dependency tersedia jika diperlukan.
3. **Validator TypeScript runtime tanpa Zod**: validasi exact fields, asset allowlist, UUID, rentang angka, ownership dan command union dapat diuji dengan Node native. Ketika AI structured output dibangun, schema JSON/Zod harus menggunakan kontrak yang sama dan contract tests.
4. **Satu kunci admin server sementara**: akun warga berada pada Phase 3; tidak ada client-only admin role. Sebelum multi-admin, ganti dengan Supabase Auth + tabel izin server-side dan audit actor per user.
5. **Module monorepo ringan**: aplikasi dan packages memakai source TypeScript bersama; tidak membuat paket kosong yang menyiratkan fitur sudah tersedia. Multiplayer server dan render-worker dibuat pada fase masing-masing.
6. Deploy mengikuti Phase 8. Tidak memindahkan Next.js ke hosting Worker dengan runtime SQLite yang tidak kompatibel.

## Integrasi fase selanjutnya

| Sistem | Sumber kebenaran | Integrasi |
|---|---|---|
| Terrain/region | PostgreSQL terrain versions & region geometry | commands terenkripsi sesi admin, chunk subscriptions, immutable event |
| Chibi | appearance/asset version per citizen | avatar ID tetap saat berpindah region atau menjadi pejabat |
| Multiplayer | Colyseus authoritative rooms | identity terverifikasi; posisi ephemeral, persist pada transisi; server terpisah dari Next |
| Proximity chat | posisi virtual server & spatial index | query sel tetangga lalu uji jarak penerima pada waktu kirim; block/report/rate limit sebelum dibuka |
| Government/voting | relational constraints & eligibility snapshot | satu vote/election/citizen, ballot privat, jabatan region-scoped pada identitas sama |
| AI Builder | validated structured plan | memakai command executor, preview dan approval; tidak menjalankan kode LLM |
| Construction | authoritative phase schedule | broadcast via transactional outbox, reconnect/late join merekonstruksi progres |
| Video | immutable event/world/appearance snapshot | BullMQ/Redis → Remotion/Three/FFmpeg worker terpisah, animasi frame-based, consent |

Next.js tidak menampung websocket room atau render video jangka panjang. Saat PostgreSQL diperkenalkan, mutation, event, dan outbox commit atomik. Redis hanya koordinasi/presence/queue; bukan storage utama world. Kamera nasional, regional, dan lokal harus memakai data dunia sama, bukan scene terpisah yang tidak sinkron.

## Keamanan dan batas

Tidak ada akun warga, chat publik, AI executable, informasi pribadi, maupun GPS. Izin admin diverifikasi server. Same-origin menolak mutation CSRF; cookie tidak tersedia bagi JS. Semua SQL memakai parameter. Rate limiter saat ini per proses dan membatasi login secara global untuk mencegah pemalsuan header IP; perlu pengganti terdistribusi dengan proxy terpercaya. Batas HTTP harus juga diterapkan pada reverse proxy karena body saat ini dibaca sebelum pemeriksaan panjang. RLS PostgreSQL dirancang deny by default; tidak diklaim sudah diterapkan pada SQLite.

## Atlas geografis Phase 2

Generator awal tetap memakai koordinat global dan rumus Phase 1. Renderer, preview, validasi penempatan, dan server memakai fungsi sampling yang sama. Setiap brush membawa UUID, pusat, radius, intensitas, biome dan referensi pulau. Validator membatasi radius per operasi dan melindungi seluruh tapak objek. Membuat pulau selalu memerlukan ruang laut yang terpisah. Operasi menghaluskan memakai rata-rata empat tetangga dari keadaan sebelum operasi.

Indeks spasial membagi operasi menurut chunk 16 × 16. Mesh yang berada dalam frustum kamera dimuat dan dilepas saat navigasi. Zoom menentukan jarak sampel 1, 2 atau 4 meter. Vegetasi biome hutan digabung ke buffer terrain. Kamera nasional dan kamera lokal menampilkan dunia otoritatif yang sama.

Batas wilayah dasar berbentuk lingkaran. Server memeriksa tingkat, cakupan induk, konflik sesama anak dan cakupan anak saat mengubah batas. Identitas negara menjadi akar. Region administratif baru tersimpan terpisah dari region warisan pada objek Phase 1. Resolusi alamat warga dan penetapan region bangunan lama membutuhkan kebijakan eksplisit pada fase berikutnya.
