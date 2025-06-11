// routes/api/megausersFE.js
const express = require("express");
const Model_Users = require("../../model/Model_Users");
const Model_Siswa = require("../../model/Model_Siswa");
const Model_Kelas = require("../../model/Model_Kelas");

const router = express.Router();

router.get("/", async function (req, res) {
  console.log("Session data (megausersFE):", req.session);

  const userId = req.session.userId;
  const level = req.session.level;

  if (!userId) {
    console.warn("❌ userId tidak ditemukan di session.");
  }
  if (level !== 'guru') {
    console.warn("❌ Level bukan guru:", level);
  }

  if (!userId || level !== 'guru') {
    return res.status(401).json({ error: "Akses ditolak: Pengguna tidak sah" });
  }


  try {
    // Ambil data pengguna berdasarkan ID sesi
    const userData = await Model_Users.getId(userId);
    if (!userData || userData.length === 0) {
      return res.status(401).json({ error: "User tidak ditemukan" });
    }

    const username = userData[0].username;
    const foto_users = userData[0].foto_users;
    const level_users = userData[0].level_users;

    // Ambil data siswa dan kelas
    const allStudents = await Model_Siswa.getAllWithKelas();
    const totalSiswa = allStudents.length;
    const allKelas = await Model_Kelas.getAll();

    // Hitung jumlah siswa per kelas
    const kelasMap = new Map();
    allKelas.forEach(kelas => {
      kelasMap.set(kelas.kode_kelas, 0);
    });

    allStudents.forEach(siswa => {
      const kodeKelas = siswa.kode_kelas;
      if (kelasMap.has(kodeKelas)) {
        kelasMap.set(kodeKelas, kelasMap.get(kodeKelas) + 1);
      } else {
        kelasMap.set(kodeKelas, 1); // fallback jika ada kelas yang tidak terdaftar
      }
    });

    const kelasStats = [];
    kelasMap.forEach((count, kodeKelas) => {
      const percentage = totalSiswa > 0 ? Math.round((count / totalSiswa) * 100) : 0;
      kelasStats.push({ kode_kelas: kodeKelas, count, percentage });
    });

    // Urutkan berdasarkan jumlah siswa
    kelasStats.sort((a, b) => b.count - a.count);

    // Kirim data lengkap ke frontend React
    return res.json({
      success: true,
      username,
      foto_users,
      level: level_users,
      totalSiswa,
      kelasStats
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
});

module.exports = router;
