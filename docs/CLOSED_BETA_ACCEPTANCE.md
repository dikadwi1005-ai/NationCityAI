# Acceptance publik Phase 5B

Jalankan setelah deployment serta biaya disetujui. Gunakan URL HTTPS dan WSS yang memiliki sertifikat publik valid, source rilis terbaru, dan akun beta yang ditetapkan operator. Jangan menyimpan password, cookie, tiket atau kode undangan dalam laporan.

| Gate | Bukti yang harus disimpan | Kriteria |
|---|---|---|
| Identitas build/database | URL health web & Colyseus, waktu, SHA deployment | kedua layanan `backend=postgres`, `schemaVersion=51`, SHA sesuai source rilis; koneksi DB gagal tidak menghidupkan SQLite |
| Migrasi | revision, ID dunia, jumlah dan signature tabel, fingerprint world | revisi awal 0 dan seluruh 32 objek/ID/koordinat identik sumber yang disetujui |
| HTTPS publik | URL, perangkat, jaringan, status sertifikat | terbuka dari jaringan selain mesin localhost, tidak mengabaikan validasi TLS |
| Closed beta | username samaran dan status hasil | undangan benar diterima; undangan salah/untuk username lain dan username di luar allowlist ditolak |
| Chibi | screenshot tanpa secret, versi penampilan | karakter dibuat, disimpan dan tetap sama setelah login ulang |
| Multiplayer | dua perangkat/jaringan; timestamp; kedua avatar terlihat | koneksi WSS, gerakan peer, collision, travel dan reconnect berfungsi |
| Proximity chat | skenario dekat/jauh/lintas pulau, frame teredaksi | penerima dekat menerima satu pesan; yang jauh tidak menerima frame pesan; mute/block/report/moderasi berfungsi |
| Pemerintahan/pemilu | election ID tes, jumlah suara agregat, audit tindakan | kandidat/review/voting/finalisasi; satu akun satu suara; akun luar eligibility ditolak; titel tampil tanpa hak admin |
| S3 nyata | ID backup, SHA ciphertext, waktu GET dan restore drill | bucket privat; encrypted upload; read-back cocok; fresh-vault/database drill baru berhasil; seluruh tabel cocok |
| Restart | SHA/signature sebelum-sesudah, log restart teredaksi | objek/karakter/hasil pemilu tetap ada setelah restart web, Colyseus dan PostgreSQL secara terkontrol |
| Akses platform | HTTP status tanpa body sensitif | warga/anonim ditolak mengubah dunia, moderasi dan backup; origin asing ditolak |
| Operasional | penggunaan RAM/CPU/egress, alert budget/backup | tidak OOM, backup tidak tertinggal, hard cap/risiko downtime dipahami |

Gunakan pemilu dan karakter QA baru yang jelas ditandai. Jangan merekonstruksi data tes lama atau mengklaimnya sebagai data migrasi. Mutasi acceptance dilakukan setelah baseline migrasi dibekukan dan dibandingkan. Jangan menghapus riwayat secara langsung hanya untuk merapikan laporan. Jika diperlukan reset beta, perlakukan sebagai operasi terpisah dengan persetujuan dan backup baru.

Pengujian dua konteks browser melalui URL publik dapat dilakukan otomatis, tetapi pemilik tetap perlu membantu pengujian pada perangkat/jaringan fisik kedua. Sampai bukti ini tersedia, tandai gate tersebut belum diuji. S3 stub, TLS loopback, status startup, atau halaman lokal bukan bukti cloud berhasil.

Template hasil: tanggal WIB, environment, URL web/WSS, SHA source/image, database backend/schema, perangkat/jaringan, daftar gate PASS/FAIL/BELUM DIUJI, backup ID/SHA, batasan dan tindakan lanjutan. Jangan menuliskan laporan PASS sebelum pengujian nyata.
