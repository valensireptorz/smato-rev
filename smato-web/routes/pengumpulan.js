// routes/pengumpulan.js

const express = require("express");
const router = express.Router();
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const path = require('path');
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

// ✅ Tampilkan semua data pengumpulan (khusus admin)
router.get("/semua", async (req, res) => {
  try {
    const response = await fetch("http://192.168.1.68:3000/api/pengumpulan/semua");
    const data = await response.json();

    if (!data.success) {
      res.render("pengumpulan/index", {
        dataPengumpulan: data.data, // ⬅ ini
        success: req.flash("success"),
        messageError: req.flash("messageError"),
        level: req.session.level,
      });
      
    }

    res.render("pengumpulan/index", {
      dataPengumpulan: data.data,
      success: req.flash("success"),
      messageError: req.flash("messageError"),
      level: req.session.level,
    });
  } catch (error) {
    console.error("Gagal ambil semua data pengumpulan:", error);
    res.status(500).json({
      success: false,
      error: "Terjadi kesalahan saat mengambil data pengumpulan",
    });
  }
});



module.exports = router;
