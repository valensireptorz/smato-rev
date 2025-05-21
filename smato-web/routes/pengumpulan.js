// routes/pengumpulan.js

const express = require("express");
const router = express.Router();
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const path = require('path');
const Model_Pengumpulan = require("../model/Model_Pengumpulan.js");
const Model_Siswa = require("../model/Model_Siswa.js"); // Tambahkan import Model_Siswa

// Route untuk mengunduh file tugas
router.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../public/images/upload', filename);

  res.download(filePath, filename, (err) => {
    if (err) {
      console.error('Gagal mengunduh file:', err);
      res.status(404).send('File tidak ditemukan');
    }
  });
});

// ✅ Tampilkan semua data pengumpulan
router.get("/semua", async (req, res) => {
  try {
    const response = await fetch("http://192.168.100.23:3000/api/pengumpulan/semua");
    
    if (!response.ok) {
      console.log(`API error: ${response.status} ${response.statusText}`);
      return res.render("pengumpulan/index", {
        dataPengumpulan: [],
        success: req.flash("success"),
        messageError: [`API tidak dapat diakses (${response.status})`],
        level: req.session.level,
      });
    }

    const data = await response.json();

    if (data.success) {
      res.render("pengumpulan/index", {
        dataPengumpulan: data.data || [],
        success: req.flash("success"),
        messageError: req.flash("messageError"),
        level: req.session.level,
      });
    } else {
      res.render("pengumpulan/index", {
        dataPengumpulan: [],
        success: req.flash("success"),
        messageError: ["Data pengumpulan tidak ditemukan"],
        level: req.session.level,
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.render("pengumpulan/index", {
      dataPengumpulan: [],
      success: req.flash("success"),
      messageError: ["Terjadi kesalahan koneksi ke server"],
      level: req.session.level,
    });
  }
});

// ✅ BARU: Tampilkan detil pengumpulan berdasarkan id_tugas (termasuk yang belum submit)
router.get("/detail/:id_tugas", async (req, res) => {
  try {
    const { id_tugas } = req.params;
    console.log("🔍 Frontend request detail untuk id_tugas:", id_tugas);
    
    // 1. Dapatkan informasi tugas
    const tugasInfo = await Model_Pengumpulan.getTugasInfo(id_tugas);
    
    if (!tugasInfo || !tugasInfo.id_kelas) {
      req.flash("messageError", "Informasi tugas tidak ditemukan");
      return res.redirect("/tugas");
    }
    
    // 2. Dapatkan semua siswa di kelas ini menggunakan query langsung
    const query = `
      SELECT 
        siswa.id_siswa,
        siswa.nama_siswa,
        siswa.nis,
        kelas.kode_kelas
      FROM siswa
      JOIN kelas ON siswa.id_kelas = kelas.id_kelas
      WHERE kelas.id_kelas = ?
      ORDER BY siswa.nama_siswa ASC
    `;
    
    // Gunakan koneksi database dari Model_Pengumpulan
    const semuaSiswa = await new Promise((resolve, reject) => {
      require('../config/database').query(query, [tugasInfo.id_kelas], (err, rows) => {
        if (err) {
          console.error("Error getting students:", err);
          reject(err);
        } else {
          console.log("✅ Jumlah siswa di kelas ini:", rows.length);
          resolve(rows);
        }
      });
    });
    
    // 3. Dapatkan siswa yang sudah mengumpulkan
    const pengumpulanData = await Model_Pengumpulan.getByTugas(id_tugas);
    
    // 4. Identifikasi siswa yang tidak mengumpulkan
    const idSiswaSudahMengumpulkan = pengumpulanData.map(p => p.id_siswa);
    
    // Filter siswa yang belum mengumpulkan
    const belumMengumpulkan = semuaSiswa.filter(siswa => 
      !idSiswaSudahMengumpulkan.includes(siswa.id_siswa)
    );
    
    res.render("pengumpulan/detail", {
      detailPengumpulan: pengumpulanData || [],
      siswaBelumMengumpulkan: belumMengumpulkan || [],
      totalSiswa: semuaSiswa.length,
      tugasInfo: tugasInfo || {},
      success: req.flash("success"),
      messageError: req.flash("messageError"),
      level: req.session.level,
    });
  } catch (error) {
    console.error("❌ Frontend error:", error);
    req.flash("messageError", "Terjadi kesalahan koneksi ke server: " + error.message);
    res.redirect("/tugas");
  }
});

// Route to delete a task submission
router.get('/delete/:id_pengumpulan', async (req, res) => {
  const { id_pengumpulan } = req.params;

  try {
    // Call the delete function from your model
    const result = await Model_Pengumpulan.delete(id_pengumpulan);

    if (result.affectedRows > 0) {
      req.flash('success', 'Pengumpulan tugas berhasil dihapus');
    } else {
      req.flash('messageError', 'Pengumpulan tugas tidak ditemukan atau sudah dihapus');
    }

    // Redirect back to the pengumpulan page after deletion
    res.redirect('/pengumpulan/semua');
  } catch (error) {
    console.error('Gagal menghapus pengumpulan:', error);
    req.flash('messageError', 'Terjadi kesalahan saat menghapus pengumpulan');
    res.redirect('/pengumpulan/semua');
  }
});

module.exports = router;