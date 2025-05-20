// routes/pengumpulan.js

const express = require("express");
const router = express.Router();
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const path = require('path');
const Model_Pengumpulan = require("../model/Model_Pengumpulan.js");

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
    const response = await fetch("http://192.168.1.17:3000/api/pengumpulan/semua");
    
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

// ✅ BARU: Tampilkan detail pengumpulan berdasarkan id_tugas (siapa saja yang sudah submit)
router.get("/detail/:id_tugas", async (req, res) => {
  try {
    const { id_tugas } = req.params;
    console.log("🔍 Frontend request detail untuk id_tugas:", id_tugas);
    
    const response = await fetch(`http://192.168.1.17:3000/api/pengumpulan/detail/${id_tugas}`);
    
    // Cek apakah response berhasil
    if (!response.ok) {
      console.log(`❌ API error: ${response.status} ${response.statusText}`);
      req.flash("messageError", `API error (${response.status}): ${response.statusText}`);
      return res.redirect("/tugas");
    }

    const data = await response.json();
    console.log("📦 Data dari API:", JSON.stringify(data, null, 2));

    if (!data.success) {
      console.log("⚠️ API response success=false:", data.message);
      // Jika tidak ada data tapi success, tetap tampilkan halaman
      req.flash("messageError", data.message || "Data detail pengumpulan tidak ditemukan");
    }

    res.render("pengumpulan/detail", {
      detailPengumpulan: data.data || [],
      tugasInfo: data.tugasInfo || {},
      success: req.flash("success"),
      messageError: req.flash("messageError"),
      level: req.session.level,
    });
  } catch (error) {
    console.error("❌ Frontend error:", error);
    req.flash("messageError", "Terjadi kesalahan koneksi ke server");
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