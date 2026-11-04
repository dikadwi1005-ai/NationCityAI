# Database

## Schema aktual v1 — SQLite

DDL idempotent ada pada constructor `packages/persistence/store.ts` dan dijalankan saat server membuka database. Ini migrasi lokal versi 1, bukan migration Supabase.

| Tabel | Kunci & data |
|---|---|
| schema_migrations | version PK |
| worlds | id PK, revision integer, state JSON text |
| world_events | request_id PK, revision UNIQUE, actor, command JSON, immutable snapshot JSON, timestamp |
| terrain_chunks | id PK, cx/cz UNIQUE, version, generator |

BEGIN IMMEDIATE melindungi compare revision dan write. Update world dan insert event berada pada transaksi sama. Kesalahan rollback seluruh transaksi. Terrain v1 disimpan sebagai generator version + koordinat; data sampel diturunkan deterministik. Editor terrain belum ada. Snapshot keseluruhan per event sengaja sederhana untuk Phase 1; ukuran database bertumbuh, sehingga retention/snapshot compaction harus dirancang sebelum produksi.

## Target PostgreSQL/Supabase — desain, belum migrasi aktif

Semua PK domain UUID. Gunakan foreign key, created_at timestamptz, version bigint, dan indeks pada semua FK yang sering digunakan. Schema private untuk data internal; schema yang diekspos harus mengaktifkan RLS dengan default deny. Tidak ada grant mutasi dunia ke anon/authenticated; command service memeriksa region permission sebelum transaksi. Jangan percaya user_metadata untuk peran admin.

- Accounts: users (referensi auth.users), citizen_profiles (user_id UNIQUE), characters, character_appearances (character_id, version UNIQUE), character_assets, character_sessions, player_last_locations, player_privacy_settings.
- World: nations; regions (nation_id, parent_id, type, name, metadata); region_boundaries (region_id, version, geometry); terrain_chunks (nation_id, cx, cz UNIQUE); terrain_versions (chunk_id, version UNIQUE, height/surface/biome reference); world_objects (region_id, owner_id, chunk_id, asset_id/version, position, rotation); roads; infrastructure; world_events (nation_id, revision UNIQUE, request_id UNIQUE, actor_id, payload, timestamp); world_snapshots (nation_id, revision UNIQUE).
- Government: government_offices; office_terms; official_assignments; elections; candidates (election_id, citizen_id UNIQUE); voter_eligibility (election_id, citizen_id UNIQUE, immutable residency); ballots (election_id, citizen_id UNIQUE, candidate_id); election_results; development_proposals. Ballots individual tidak boleh tersedia publik.
- Multiplayer/moderation: chat_messages (retention terbatas), chat_reports, user_blocks (blocker_id, blocked_id UNIQUE), moderation_actions, connection_audit_events. Posisi per frame tetap di Colyseus, bukan insert PostgreSQL.
- Construction/video: construction_projects; construction_phases (project_id, sequence UNIQUE); episode_projects; episode_scenes; video_render_jobs; media_assets. Referensi immutable world/appearance/assets untuk setiap episode.

## Migrasi berikutnya

Setelah project Supabase dipilih: buat migration dengan CLI resmi, verifikasi schema dan RLS pada database test, jalankan adapter contract tests yang sama, import world/event/terrain dengan ID tetap, lalu alihkan koneksi. Jangan menganggap diagram target sebagai database yang telah diimplementasikan. Future table implementation mengikuti fase yang memerlukannya.

## Migrasi SQLite v2

Saat membuka dunia, transaksi menambahkan properti geo berisi daftar operasi kosong jika properti itu belum ada dan mencatat schema_migrations versi 2. Revisi lama, ID bangunan, tabel event, dan snapshot historis dipertahankan. Setiap mutasi atlas menulis state, versi chunk terdampak, dan event dalam satu transaksi BEGIN IMMEDIATE. Undo menghapus operasi terakhir dari proyeksi aktif dan mencatat event baru. Redo memakai kembali identitas operasi. Snapshot lama tetap dapat dibaca sebagai generator v1 dengan daftar operasi kosong.

Untuk migrasi PostgreSQL, bekukan tulisan sementara, ambil backup SQLite konsisten, impor snapshot dan event dengan ID asli, buat indeks unik (nation_id, cx, cz) dan (nation_id, revision), lalu bandingkan jumlah objek, ID, koordinat, hash event, serta sampel batas chunk. Jalankan suite adapter dan pengujian konflik sebelum pengalihan transaksi. Pertahankan backup SQLite untuk rollback sebelum menerima tulisan baru. Untuk jangka panjang, materialisasikan checkpoint per chunk dengan delta setelah checkpoint, dan sediakan endpoint subscription per area.

## Operasi chat Phase 4

SQLite menambahkan chat_preferences (mute satu arah, block dua arah), chat_reports (bukti dari pesan yang benar-benar diterima), chat_sanctions (chat atau akun hingga waktu tertentu), dan moderation_audit. Penyelesaian laporan, pemberian sanksi, pencabutan sesi akun dan pencatatan audit berjalan dalam satu transaksi. Ekspor staging PostgreSQL menyertakan empat tabel, menggunakan RLS default-deny dan memilih bukti serta audit yang masih dalam retensi. Tidak ada tabel riwayat percakapan umum.

Server membersihkan bukti setelah 30 hari dan metadata audit setelah 90 hari saat startup dan secara berkala selama aktif. Penghapusan baris tidak menghapus salinan yang telah dibuat di backup eksternal; operator harus menerapkan retensi yang sesuai pada backup.
