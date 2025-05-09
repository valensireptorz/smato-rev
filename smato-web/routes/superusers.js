var express = require("express");
const Model_Users = require("../model/Model_Users");
const Model_Siswa = require("../model/Model_Siswa"); // Import Model_Siswa
const Model_Kelas = require("../model/Model_Kelas"); // Import Model_Kelas
var router = express.Router();

router.get("/", async function (req, res, next) {
  try {
    let level_users = req.session.level;
    let id = req.session.userId;
    let Data = await Model_Users.getId(id);
    
    if (Data.length > 0) {
      if (Data[0].level_users != "admin") {
        return res.redirect("/logout");
      }
      
      // Ambil semua data kelas untuk penghitungan
      const allKelas = await Model_Kelas.getAll();
      
      // Ambil data siswa dengan informasi kelas
      const allStudents = await Model_Siswa.getAllWithKelas();
      const totalSiswa = allStudents.length;
      
      // Inisialisasi Map untuk menyimpan jumlah siswa per kelas
      const kelasMap = new Map();
      
      // Inisialisasi semua kelas dengan jumlah 0
      allKelas.forEach(kelas => {
        kelasMap.set(kelas.kode_kelas, 0);
      });
      
      // Hitung jumlah siswa per kelas
      allStudents.forEach(siswa => {
        const kodeKelas = siswa.kode_kelas;
        if (kelasMap.has(kodeKelas)) {
          kelasMap.set(kodeKelas, kelasMap.get(kodeKelas) + 1);
        } else {
          // Jika ada kelas yang tidak ada di tabel kelas (seharusnya tidak terjadi)
          kelasMap.set(kodeKelas, 1);
        }
      });
      
      // Konversi ke array untuk template dan hitung persentase
      const kelasStats = [];
      kelasMap.forEach((count, kodeKelas) => {
        // Hindari pembagian dengan nol
        const percentage = totalSiswa > 0 ? Math.round((count / totalSiswa) * 100) : 0;
        kelasStats.push({
          kode_kelas: kodeKelas,
          count: count,
          percentage: percentage
        });
      });
      
      // Urutkan berdasarkan jumlah siswa (terbanyak dulu)
      kelasStats.sort((a, b) => b.count - a.count);
      
      // Render dashboard
      res.render("users/super", {
        title: "Users Home",
        username: Data[0].username,
        foto_users: Data[0].foto_users,
        level: level_users,
        kelasStats: kelasStats,  // Tambahkan statistik kelas
        totalSiswa: totalSiswa   // Tambahkan total siswa
      });
      
    } else {
      res.status(401).json({ error: "user tidak ada" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(501).json("Butuh akses login");
  }
});

module.exports = router;