# AI NATION BUILDER — PHASE 5C ADDITION
## Living World Simulation: Dummy Chibi NPCs, Pedestrians, Vehicles & Traffic

Tambahkan persyaratan berikut ke **Phase 5C — Complete Game UI/UX & 3D Visual Overhaul** yang sedang dikerjakan.

Saya ingin dunia AI Nation Builder terlihat hidup meskipun belum ada followers yang sedang online.

Karena proyek masih berada dalam tahap pengujian, gunakan **dummy NPC dan kendaraan simulasi** terlebih dahulu.

**PENTING:** Jangan mengganti atau menghapus instruksi Phase 5C sebelumnya. Ini merupakan tambahan pekerjaan visual dan gameplay.

## 1. Living World

Ketika game dibuka, dunia harus menampilkan aktivitas sehari-hari.

Contoh:
- Warga Chibi berjalan di pinggir jalan.
- Warga berjalan menuju rumah.
- Warga keluar dari rumah.
- Beberapa warga berkumpul di taman.
- Kendaraan melintas di jalan.
- Kendaraan berhenti di persimpangan.
- Kendaraan berbelok.
- Warga berjalan menuju balai negara atau klinik.
- Beberapa kendaraan diparkir.

Aktivitas tidak boleh hanya berupa model statis.

Setiap NPC atau kendaraan aktif harus memiliki posisi dan pergerakan aktual dalam scene 3D.

## 2. Dummy Chibi NPCs

Gunakan desain Chibi 3D yang konsisten dengan Character Creator Phase 3.

Tambahkan variasi:
- Rambut.
- Pakaian.
- Warna.
- Aksesori.
- Animasi berjalan.
- Idle.
- Berhenti dan melihat sekitar.
- Duduk jika tempat duduk tersedia.
- Melambaikan tangan.

Gunakan karakter NPC yang terlihat natural, bukan semua NPC mempunyai wajah dan pakaian identik.

NPC dummy tidak perlu mempunyai akun warga asli.

Jangan membuat akun palsu di database `citizens`.

## 3. Pedestrian Movement System

Implementasikan sistem pergerakan pejalan kaki.

Persyaratan:
- NPC mengikuti jalur yang dapat dilalui.
- NPC menghindari bangunan.
- NPC tidak berjalan di laut.
- NPC menyesuaikan elevasi terrain.
- NPC menggunakan trotoar atau jalur pedestrian jika tersedia.
- NPC dapat memilih tujuan.
- NPC dapat berjalan dari satu titik ke titik lain.
- NPC dapat berhenti sejenak kemudian melanjutkan aktivitas.

Gunakan waypoint graph atau pathfinding ringan.

Hindari NPC yang hanya bergerak bolak-balik dalam garis lurus tanpa tujuan.

## 4. Dummy Vehicles

Tambahkan model kendaraan stylized low-poly 3D yang sesuai dengan ukuran dunia.

Jenis awal:
- Mobil warga.
- Motor.
- Bus kecil atau angkutan umum.
- Mobil layanan.
- Kendaraan konstruksi sebagai aset persiapan Phase 6.

Kendaraan harus memiliki:
- Body 3D.
- Roda.
- Jendela.
- Lampu.
- Warna bervariasi.
- Orientasi sesuai arah gerak.
- Animasi roda sederhana.

Tidak perlu model fotorealistis.

Targetnya adalah kendaraan miniature stylized yang menarik dan konsisten dengan bangunan.

## 5. Road Traffic Simulation

Implementasikan simulasi lalu lintas dasar.

Kendaraan harus:
- Bergerak mengikuti jaringan jalan.
- Mengikuti arah jalur.
- Berbelok pada persimpangan.
- Berhenti jika jalur terhalang.
- Menjaga jarak sederhana.
- Tidak menembus bangunan.
- Tidak berjalan di laut atau area non-road.
- Mengikuti elevasi jalan.

Buat sistem traffic routing ringan yang kompatibel dengan World Engine.

Jika jalan belum memiliki metadata jaringan yang cukup, bangun adapter routing visual tanpa merusak objek jalan Phase 1–5.

Jangan mengubah database dunia secara permanen hanya untuk menambahkan kendaraan dummy.

## 6. Dynamic NPC Behavior

Tambahkan state aktivitas sederhana:

IDLE → WALKING → ARRIVING → ACTIVITY → NEXT_DESTINATION.

Contoh:
- NPC A keluar dari rumah, berjalan ke taman, berhenti, kemudian berjalan kembali.
- NPC B berjalan menuju klinik.
- NPC C berjalan di tepi jalan.
- Kendaraan A melintas ke persimpangan kemudian berbelok.
- Kendaraan B berhenti sementara di depan bangunan.

Gunakan variasi waktu aktivitas supaya tidak semua NPC bergerak bersamaan secara sinkron.

Pergerakan harus halus dan tidak teleportasi secara acak.

## 7. Simulation Controls

Tambahkan pengaturan pada Game HUD:

**World Activity**
- NPC Population: Off / Low / Medium / High.
- Traffic Density: Off / Low / Medium / High.
- Pause Simulation.
- Resume Simulation.
- Simulation Speed: 1x / 2x.
- Show NPC Paths (debug only).

Berikan default yang ringan untuk perangkat menengah.

Pada perangkat mobile, gunakan kepadatan lebih rendah secara otomatis bila diperlukan.

## 8. NPC vs Real Players

Pisahkan secara jelas:
- Real multiplayer players.
- Dummy NPC.
- Simulation vehicles.

NPC tidak boleh:
- Menggunakan akun palsu.
- Dihitung sebagai pemain online.
- Ikut memilih dalam pemilu.
- Mengirim chat seolah-olah warga sungguhan.
- Menjadi pejabat.
- Mempunyai akses administrator.
- Mempengaruhi statistik warga terdaftar.

Jika perlu tampilkan penanda NPC ketika karakter dipilih.

Jumlah NPC harus dilaporkan sebagai **populasi simulasi**, bukan jumlah followers online.

## 9. Performance

Gunakan sistem yang efisien:
- Shared geometry.
- Shared materials.
- Instancing bila memungkinkan.
- Animation LOD.
- Spatial culling.
- Update frequency berdasarkan jarak kamera.
- Batasi jumlah NPC dan kendaraan aktif.
- Cleanup saat berpindah pulau.
- Tidak membuat network request untuk setiap NPC movement.

Untuk tahap ini, simulasi NPC boleh berjalan secara lokal di client karena bersifat dekoratif dan tidak memengaruhi state otoritatif negara.

Gunakan seeded random generation agar penempatan dan aktivitas simulasi dapat direproduksi.

Jangan menulis setiap posisi NPC ke database.

## 10. Integration

Integrasikan dengan:
- Fullscreen viewport Phase 5C.
- HUD baru.
- Bangunan yang diperbarui.
- Jaringan jalan.
- Terrain.
- Character Creator.
- Multiplayer.
- Kamera isometrik.

Pastikan NPC tidak menghalangi sistem penempatan bangunan admin.

Jika jalan atau bangunan baru dibuat, simulasi harus dapat memperbarui jalurnya tanpa memerlukan reset seluruh dunia.

## 11. Visual Acceptance Tests

Lakukan pengujian browser nyata.

Verifikasi:
1. Dunia memiliki NPC berjalan.
2. Beberapa NPC menggunakan variasi penampilan.
3. NPC tidak menembus bangunan.
4. NPC tidak berjalan di laut.
5. Kendaraan bergerak mengikuti jalan.
6. Kendaraan berbelok dengan orientasi yang benar.
7. Kendaraan tidak menembus bangunan.
8. Pause/Resume bekerja.
9. Density Settings bekerja.
10. NPC tidak dihitung sebagai warga asli.
11. Pemain asli tetap dapat menggunakan multiplayer.
12. Proximity Chat tetap menggunakan pemain asli.
13. FPS dan draw calls diukur pada setiap density setting.
14. Perpindahan antarpulau tidak menyebabkan NPC duplikat.
15. World data dan database tidak berubah akibat simulasi dekoratif.

Ambil screenshot dan rekaman singkat dari aplikasi nyata yang memperlihatkan NPC dan kendaraan bergerak.

## 12. Deliverables

Implementasikan:
- Dummy Chibi NPC System.
- Pedestrian pathfinding.
- Stylized vehicle models.
- Basic road traffic simulation.
- World Activity Controls.
- Integration with fullscreen game HUD.
- Performance optimization.

Tambahkan laporan:

`docs/PHASE_5C_LIVING_WORLD_REPORT.md`

Jelaskan fitur yang benar-benar berjalan, batasan, hasil pengujian, dan performanya.

**INSTRUKSI AKHIR:**

Gabungkan pekerjaan Living World Simulation dengan Phase 5C Visual Overhaul yang sedang berjalan.

Jangan mengerjakan ulang seluruh sistem.

Jangan membuat NPC hanya sebagai animasi dekoratif statis.

Saya ingin dunia negara terlihat hidup ketika belum ada followers online, tetapi dummy NPC tidak boleh memengaruhi data asli warga, voting, atau multiplayer.

Jangan melanjutkan Phase 6 dan jangan melakukan deployment berbayar tanpa persetujuan saya.