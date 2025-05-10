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

// In routes/pengumpulan.js
router.get("/semua", async (req, res) => {
  try {
    const response = await fetch("http://192.168.1.9:3000/api/pengumpulan/semua");
    const data = await response.json();

    // Check if the data is present
    if (data.success) {
      res.render("pengumpulan/index", {
        dataPengumpulan: data.data || [], // Ensure it's always an array, even if empty
        success: req.flash("success"),
        messageError: req.flash("messageError"),
        level: req.session.level,
      });
    } else {
      res.render("pengumpulan/index", {
        dataPengumpulan: [],
        success: req.flash("success"),
        messageError: req.flash("messageError"),
        level: req.session.level,
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      error: "Error while fetching data",
    });
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


module.exports = router;
