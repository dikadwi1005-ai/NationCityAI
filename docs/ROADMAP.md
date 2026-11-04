# Roadmap dan acceptance gates

Master specification tetap sumber kebenaran. Tidak ada fitur utama dihapus; semua fitur di luar Phase 1 ditunda sesuai roadmap master.

1. **3D Nation Foundation — lulus.** Lihat PHASE_1_REPORT.md.
2. **Expandable Nation Map — lulus uji penerimaan lokal.** Lihat PHASE_2_REPORT.md untuk cakupan, bukti browser dan batas streaming.
3. **Chibi Citizens & Multiplayer.** Supabase Auth, profile/privacy/appearance version, Colyseus, movement & travel validation, room handoff, nearby visibility, reconnect. Acceptance: dua akun/avatar persisten terlihat bersama.
4. **Spatial Chat.** Adjacent-cell spatial queries, recipient distance authorization, UI handoff/hysteresis, block/report/mute/moderation/rate limiting. Acceptance tiga pemain termasuk boundary cells dan perpindahan jarak; tidak boleh membuka chat sebelum kontrol berfungsi.
5. **Government & Elections.** Office hierarchy, eligibility snapshot, candidature, ballots unique constraint, private votes, auditable tally, terms/roles. Acceptance vote tepat sekali dan role benar.
6. **AI Builder & Construction.** Structured plans, validation, preview/approval, proposals, authoritative timeline/outbox, pause/resume/cancel, NPC construction visuals. Acceptance dua pemain melihat progres konsisten.
7. **Automatic Video.** Snapshot director, narration/subtitles/audio, Remotion + Three + FFmpeg workers, actual MP4. Acceptance video vertikal 10–15 detik dari proyek nyata; consent dan privacy gate.
8. **Production Readiness.** Assets, moderation lengkap, distributed scaling, profiling/load testing, observability, backups/restore, security review, deployment. Tidak menjanjikan kapasitas pemain tanpa pengukuran.

Cross-cutting: domain commands, stable identifiers, versioned assets/world snapshots, migration tests, strict server authorization, localization Bahasa Indonesia dan future English, documentation setiap keputusan.


Status Phase 3: lulus penerimaan lokal dua akun. Lihat [laporan Phase 3](PHASE_3_REPORT.md).

Phase 4 lulus pengujian lokal. Bukti penerimaan tiga akun serta batas operasional ada di [laporan Phase 4](PHASE_4_REPORT.md).

Phase 5 lulus penerimaan lokal pemilu, penetapan jabatan dan pemulihan database uji. Lihat [laporan Phase 5](PHASE_5_REPORT.md). Kesiapan produksi memerlukan latihan restore off-site nyata dan uji konkurensi di lingkungan target. Phase 6 menggunakan antrean proposal APPROVED.

Phase 5B: persiapan deployment dan audit runtime lokal tersedia. Lihat [audit 4 November 2026](PHASE_5B_RUNTIME_AUDIT.md). Database aktif merupakan starter baru; migrasi cloud memerlukan pilihan sumber dari pemilik. HTTPS/WSS internet dan S3 nyata belum terverifikasi. Phase 6 belum dimulai.
